import { prisma } from "../../lib/prisma.js";
import { refreshW3SchoolsCatalog } from "../../jobs/w3schools.job.js";
import { scrapeBdjobs } from "../../lib/bdjobs.scraper.js";
import AppError from "../../utils/AppError.js";
import type { SearchJob, SearchJobsResult } from "./jobs.interface.js";

// BDJOBs jobs are scraped into the `bdjobs_jobs` table by `npm run crawl:bdjobs`
// (a local crawler that hits bdjobs' public JSON API — see src/lib/bdjobs.scraper.ts).
// The API only ever reads from the DB so responses are fast and safe on
// Vercel serverless (no browser available).

const tokenizeQuery = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
};

const mapRow = (row: any): SearchJob => ({
  id: row.id,
  title: row.title,
  company: row.company ?? null,
  location: row.location ?? null,
  salary: row.salary ?? null,
  job_type: row.jobType ?? null,
  publication_date: row.publicationDate
    ? new Date(row.publicationDate).toISOString()
    : null,
  tags: row.category ? [row.category] : [],
  snippet: (row.description ?? "").slice(0, 200),
  url: row.url,
});

const searchBdjobsFromDb = async (
  query: string,
  page: number,
  limit: number,
): Promise<SearchJobsResult> => {
  const tokens = tokenizeQuery(query);
  const skip = (page - 1) * limit;

  // One AND-clause per token, each matching across the searchable columns.
  const baseWhere = tokens.map((token) => ({
    OR: [
      { title: { contains: token, mode: "insensitive" as const } },
      { company: { contains: token, mode: "insensitive" as const } },
      { location: { contains: token, mode: "insensitive" as const } },
      { category: { contains: token, mode: "insensitive" as const } },
    ],
  }));

  const where = baseWhere.length > 0 ? { AND: baseWhere } : {};

  try {
    const rows = await prisma.bdjobsJobs.findMany({
      where,
      orderBy: [
        { publicationDate: { sort: "desc", nulls: "last" } },
        { scrapedAt: "desc" },
      ],
      skip,
      take: limit,
    });

    // AND-token matching can be too strict ("data analysis" misses titles that
    // only contain one of the terms). Fall back to any-token so the user never
    // sees an empty page.
    if (rows.length === 0 && baseWhere.length > 1) {
      const looseRows = await prisma.bdjobsJobs.findMany({
        where: { OR: baseWhere },
        orderBy: [{ publicationDate: { sort: "desc", nulls: "last" } }, { scrapedAt: "desc" }],
        skip,
        take: limit,
      });
      return {
        jobs: looseRows.map(mapRow),
        page,
        limit,
        total_jobs: 0,
      };
    }

    const total = await prisma.bdjobsJobs.count({ where });

    return {
      jobs: rows.map(mapRow),
      page,
      limit,
      page_count: Math.max(1, Math.ceil(total / limit)),
      total_jobs: total,
    };
  } catch (error: any) {
    throw new AppError(
      error?.message ?? "Job search is unavailable. Please try again in a moment.",
      502,
    );
  }
};

const searchJobs = async (
  query: string,
  page = 1,
  limit = 10,
): Promise<SearchJobsResult> => {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 50);
  return searchBdjobsFromDb(query, safePage, safeLimit);
};

const crawlBdjobs = async (
  searchTerm: string,
  maxPages = 3,
): Promise<{ searchTerm: string; saved: number }> => {
  const result = await scrapeBdjobs(searchTerm, maxPages);

  if (result.entries.length === 0) {
    throw new AppError("No jobs found for the given search term", 404);
  }

  const UPSERT_CHUNK = 10;
  let saved = 0;

  for (let i = 0; i < result.entries.length; i += UPSERT_CHUNK) {
    const chunk = result.entries.slice(i, i + UPSERT_CHUNK);

    const upserts = chunk.map((entry) =>
      prisma.bdjobsJobs.upsert({
        where: { sourceJobId: entry.sourceJobId },
        create: {
          sourceJobId: entry.sourceJobId,
          title: entry.title,
          company: entry.company,
          location: entry.location,
          salary: entry.salary,
          jobType: entry.jobType,
          category: entry.category,
          publicationDate: entry.publicationDate,
          deadlineDate: entry.deadlineDate,
          description: entry.description,
          url: entry.url,
          searchTerm: entry.searchTerm,
          scrapedAt: new Date(),
        },
        update: {
          title: entry.title,
          company: entry.company,
          location: entry.location,
          salary: entry.salary,
          jobType: entry.jobType,
          category: entry.category,
          publicationDate: entry.publicationDate,
          deadlineDate: entry.deadlineDate,
          description: entry.description,
          url: entry.url,
          searchTerm: entry.searchTerm,
          scrapedAt: new Date(),
        },
      }),
    );

    await prisma.$transaction(upserts, { timeout: 30_000 });
    saved += chunk.length;
  }

  return { searchTerm, saved };
};

export const jobsService = {
  searchJobs,
  crawlBdjobs,
  refreshW3SchoolsCatalog,
};