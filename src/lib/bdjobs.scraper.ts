// ─── BDJOBs API scraper ────────────────────────────────────────────
// bdjobs.com is an Angular SPA — job cards are rendered client-side, so
// there are no static DOM selectors to scrape with Selenium. Instead the
// site exposes public JSON APIs (no auth) which we hit directly:
//
//   Search:  GET https://gateway.bdjobs.com/recruitment-account-test/api/JobSearch/GetJobSearch
//            ?keyword=<term>&isFresher=false&pg=<page>&ToggleJobs=true&isPro=0&rpp=50
//   Detail:  GET https://gateway.bdjobs.com/ActtivejobsTest/api/JobSubsystem/jobDetails?jobId=<id>
//
// Scraping runs locally (never on Vercel serverless).

const SEARCH_API_URL =
  process.env.BDJOBS_SEARCH_API_URL ??
  "https://gateway.bdjobs.com/recruitment-account-test/api/JobSearch/GetJobSearch";
const DETAIL_API_URL =
  process.env.BDJOBS_DETAIL_API_URL ??
  "https://gateway.bdjobs.com/ActtivejobsTest/api/JobSubsystem/jobDetails";
const MAX_PAGES = Number(process.env.BDJOBS_MAX_PAGES ?? "3");
const RESULTS_PER_PAGE = Number(process.env.BDJOBS_RPP ?? "50");
const REQUEST_TIMEOUT_MS = Number(process.env.BDJOBS_REQUEST_TIMEOUT_MS ?? "30000");
const PAGE_DELAY_MS = Number(process.env.BDJOBS_PAGE_DELAY_MS ?? "800");
const DETAIL_DELAY_MS = Number(process.env.BDJOBS_DETAIL_DELAY_MS ?? "500");

const UA = "Mozilla/5.0 (compatible; CareerForgeBD/1.0)";

export interface BdjobsScrapeEntry {
  sourceJobId: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  jobType: string | null;
  category: string | null;
  publicationDate: Date | null;
  deadlineDate: Date | null;
  description: string | null;
  url: string;
  searchTerm: string;
}

export interface BdjobsScrapeResult {
  totalExtracted: number;
  unique: number;
  pages: number;
  searchTerm: string;
}

interface SearchHit {
  Jobid?: string | number;
  jobTitle?: string;
  JobTitle?: string;
  companyName?: string;
  CompnayName?: string;
  location?: string;
  Salary?: unknown;
  salary?: unknown;
  JobType?: string;
  jobType?: string;
  Cat_id?: string | number;
  Category?: string | null;
  deadlineDB?: string;
  DeadlineDB?: string;
  publishDate?: string;
  PostedOn?: string;
  jobDescription?: string | null;
  jobContext?: string | null;
}

interface DetailHit {
  JobId?: string;
  JobTitle?: string;
  CompnayName?: string;
  JobLocation?: string;
  JobSalaryRange?: string | null;
  JobSalaryMinSalary?: number | string;
  JobSalaryMaxSalary?: number | string;
  DeadlineDB?: string;
  PostedOn?: string;
  JobDescription?: string | null;
  JobContext?: string | null;
  JobNature?: string | null;
  CategoryName?: string | null;
}

const cleanText = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const stripped = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return stripped ? stripped : null;
};

const formatSalary = (raw: unknown, detail?: DetailHit): string | null => {
  if (detail?.JobSalaryRange && detail.JobSalaryRange.trim() && detail.JobSalaryRange !== "--") {
    return detail.JobSalaryRange.trim();
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "--" || trimmed === "Negotiable") return null;
    return trimmed;
  }
  if (raw && typeof raw === "object") {
    const s = raw as {
      SalaryRange?: string | null;
      MinSalary?: number;
      MaxSalary?: number;
      IsNegotiable?: boolean;
    };
    if (s.SalaryRange) return s.SalaryRange;
    const min = Number(s.MinSalary) || 0;
    const max = Number(s.MaxSalary) || 0;
    if (min > 0 && max > 0) return `Tk. ${min} - ${max} (Monthly)`;
    if (min > 0) return `Tk. ${min} (Monthly)`;
    if (s.IsNegotiable) return null;
  }
  return null;
};

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`BDJOBs fetch failed: ${(err as Error).message}`);
    return null;
  }
};

const searchUrl = (keyword: string, page: number): string => {
  const url = new URL(SEARCH_API_URL);
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("isFresher", "false");
  url.searchParams.set("pg", String(page));
  url.searchParams.set("ToggleJobs", "true");
  url.searchParams.set("isPro", "0");
  url.searchParams.set("rpp", String(RESULTS_PER_PAGE));
  return url.toString();
};

const detailUrl = (jobId: string): string =>
  `${DETAIL_API_URL}?jobId=${encodeURIComponent(jobId)}`;

const jobUrl = (jobId: string): string =>
  `https://jobs.bdjobs.com/jobdetails.asp?id=${encodeURIComponent(jobId)}`;

const fetchJobDetail = async (jobId: string): Promise<DetailHit | null> => {
  const body = await fetchJson<{ data?: DetailHit[] }>(detailUrl(jobId));
  const hit = body?.data?.[0];
  if (!hit || hit.JobId === undefined) return null;
  return hit;
};

const toEntry = (hit: SearchHit, searchTerm: string, detail: DetailHit | null): BdjobsScrapeEntry | null => {
  const id = String(hit.Jobid ?? "").trim();
  if (!id) return null;

  const title = cleanText(hit.jobTitle ?? hit.JobTitle ?? detail?.JobTitle) ?? "";
  if (!title) return null;

  const publicationDate = parseDate(hit.publishDate ?? detail?.PostedOn);
  const deadlineDate = parseDate(hit.deadlineDB ?? detail?.DeadlineDB);

  const rawDescription = cleanText(
    detail?.JobDescription ?? hit.jobDescription ?? hit.jobContext ?? detail?.JobContext,
  );

  return {
    sourceJobId: id,
    title,
    company: cleanText(hit.companyName ?? hit.CompnayName ?? detail?.CompnayName),
    location: cleanText(hit.location ?? detail?.JobLocation),
    salary: formatSalary(hit.Salary ?? hit.salary, detail ?? undefined),
    jobType: cleanText(hit.JobType ?? hit.jobType ?? detail?.JobNature),
    category: cleanText(detail?.CategoryName ?? hit.Category),
    publicationDate,
    deadlineDate,
    description: rawDescription,
    url: jobUrl(id),
    searchTerm,
  };
};

/**
 * Crawls BDJOBs by keyword using their public JSON API. Returns unique
 * entries (deduped by job id) across the requested pages, with detail
 * page data (full description + salary) merged in.
 */
export const scrapeBdjobs = async (
  searchTerm: string,
  maxPages: number = MAX_PAGES,
): Promise<BdjobsScrapeResult & { entries: BdjobsScrapeEntry[] }> => {
  const keyword = searchTerm.trim();
  if (!keyword) {
    throw new Error("searchTerm is required");
  }

  const entriesMap = new Map<string, BdjobsScrapeEntry>();
  let pages = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    pages += 1;
    const body = await fetchJson<{ data?: SearchHit[]; premiumData?: SearchHit[]; common?: { totalpages?: number } }>(
      searchUrl(keyword, page),
    );

    const hits = [...(body?.data ?? []), ...(body?.premiumData ?? [])];
    if (hits.length === 0) break;

    for (const hit of hits) {
      const id = String(hit.Jobid ?? "").trim();
      if (!id || entriesMap.has(id)) continue;

      const detail = await fetchJobDetail(id);
      const entry = toEntry(hit, keyword, detail);
      if (entry) entriesMap.set(id, entry);

      if (DETAIL_DELAY_MS > 0) await sleep(DETAIL_DELAY_MS);
    }

    const totalPages = Number(body?.common?.totalpages ?? 0);
    if (page >= totalPages) break;

    if (PAGE_DELAY_MS > 0) await sleep(PAGE_DELAY_MS);
  }

  const entries = [...entriesMap.values()];
  return {
    totalExtracted: entries.length,
    unique: entries.length,
    pages,
    searchTerm: keyword,
    entries,
  };
};
