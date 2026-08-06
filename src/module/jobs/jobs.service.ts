import { prisma } from "../../lib/prisma.js";
import { refreshW3SchoolsCatalog } from "../../jobs/w3schools.job.js";
import AppError from "../../utils/AppError.js";
import type { SearchJob, SearchJobsResult } from "./jobs.interface.js";

// BDJOBs jobs are scraped into the `bdjobs_jobs` table by a local Selenium
// crawler (`npm run crawl:bdjobs`). The API only ever reads from the DB so
// responses are fast and safe on Vercel serverless (no browser available).
// See src/lib/bdjobs.scraper.ts and src/jobs/crawl-bdjobs.ts.

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

export const jobsService = {
  searchJobs,
  refreshW3SchoolsCatalog,
};