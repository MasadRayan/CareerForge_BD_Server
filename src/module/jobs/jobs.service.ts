import axios from "axios";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { refreshW3SchoolsCatalog } from "../../jobs/w3schools.job.js";
import type { SearchJob, SearchJobsResult } from "./jobs.interface.js";

const REMOTIVE_URL = "https://remotive.com/api/remote-jobs";
const REMOTIVE_CATEGORY = "software-dev";
const REQUEST_TIMEOUT_MS = 8_000;

const stripHtml = (html: string = ""): string => {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

// Generic role words that don't narrow a search (e.g. "developer" matches
// nearly every software job). Remotive's `search` also matches descriptions,
// so after fetching we re-filter on the TITLE only using the remaining,
// distinctive tokens.
const TITLE_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "in", "on", "with", "to", "at",
  "it", "job", "jobs", "position", "role", "roles", "opening", "remote",
  "developer", "developers", "engineer", "engineers", "engineering",
  "senior", "junior", "staff", "lead", "principal", "software", "web",
]);

const normalizeForTitle = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
};

const tokenizeQuery = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !TITLE_STOPWORDS.has(token));
};

const isTitleRelevant = (title: string, queryTokens: string[]): boolean => {
  if (queryTokens.length === 0) return true;

  const titleNorm = normalizeForTitle(title);

  // Whole normalized query ("fullstack") or every distinctive token must appear.
  if (titleNorm.includes(queryTokens.join(""))) return true;
  return queryTokens.every((token) => titleNorm.includes(token));
};

const normalizeJob = (raw: Record<string, unknown>): SearchJob => {
  const id = (raw.id ?? raw.url ?? "") as string;
  const description = stripHtml((raw.description as string) ?? "");
  const tags = Array.isArray(raw.tags)
    ? (raw.tags as unknown[]).filter((t): t is string => typeof t === "string")
    : [];

  return {
    id: String(id),
    title: (raw.title as string) ?? "Untitled",
    company: (raw.company_name as string) ?? null,
    location: (raw.candidate_required_location as string) ?? null,
    salary: (raw.salary as string) ?? null,
    job_type: (raw.job_type as string) ?? null,
    publication_date: (raw.publication_date as string) ?? null,
    tags,
    snippet: description.slice(0, 200),
    url: (raw.url as string) ?? "",
  };
};

const searchJobsFromRemotive = async (
  query: string,
  page: number,
  limit: number,
): Promise<SearchJobsResult> => {
  const params: Record<string, string | number> = {
    category: REMOTIVE_CATEGORY,
    page,
    limit,
  };
  if (query.trim()) params.search = query.trim();

  let data: Record<string, unknown>;
  try {
    const res = await axios.get(REMOTIVE_URL, {
      params,
      timeout: REQUEST_TIMEOUT_MS,
      headers: { "User-Agent": "CareerForgeBD/1.0" },
    });
    data = (res.data ?? {}) as Record<string, unknown>;
  } catch (error: any) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: error?.message ?? "Remotive request failed",
          metadata: { stage: "jobs.search", provider: "remotive" },
        },
      })
      .catch(() => {});
    throw new AppError(
      "Job search is unavailable. Please try again in a moment.",
      502,
    );
  }

  const jobs = Array.isArray(data.jobs) ? (data.jobs as Record<string, unknown>[]) : [];
  const queryTokens = tokenizeQuery(query);

  const relevantJobs = jobs
    .map(normalizeJob)
    .filter((job) => isTitleRelevant(job.title, queryTokens))
    .slice(0, limit);

  return {
    jobs: relevantJobs,
    page,
    limit,
    page_count: (data["page-count"] as number) ?? undefined,
    total_jobs: (data["total-jobs"] as number) ?? undefined,
  };
};

const searchJobs = async (query: string, page = 1, limit = 10): Promise<SearchJobsResult> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  return searchJobsFromRemotive(query, safePage, safeLimit);
};

export const jobsService = {
  searchJobs,
  refreshW3SchoolsCatalog,
};