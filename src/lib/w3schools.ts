import * as cheerio from "cheerio";
import { prisma } from "./prisma.js";

const BASE = "https://www.w3schools.com";
const UA = "Mozilla/5.0 (compatible; CareerForgeBD/1.0)";

const MAX_COURSES = 60;
const MAX_LINKS_PER_COURSE = 120;
const MAX_TITLE_LENGTH = 60;

const NOISE_TOPICS = new Set([
  "academy",
  "bootcamp",
  "certified",
  "practice",
  "faq",
  "exit",
  "tutorials",
  "news",
  "login",
  "forum",
  "spaces",
  "tools",
  "league",
  "exercises",
  "challenges",
  "videos",
  "codegame",
  "references",
  "statistics",
  "googlesheets",
  "xml",
  "howto",
  "typing",
  "where_to_start",
]);

// Known-stable classic tutorial roots no longer linked from the new
// /tutorials/ index page, so we seed them explicitly.
const STATIC_SLUGS = [
  "html", "css", "js", "python", "sql", "java", "php", "react", "nodejs",
  "jquery", "bootstrap", "bootstrap5", "w3css", "angular", "asp", "mysql",
  "git", "cpp", "r", "xml",
];

const fetchHtml = async (url: string): Promise<string> => {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`W3Schools fetch failed (${res.status}): ${url}`);
  }
  return res.text();
};

const normalizeUrl = (href: string, course: string): string => {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${BASE}${trimmed}`;
  return `${BASE}/${course}/${trimmed}`;
};

interface CatalogEntry {
  topic: string;
  title: string;
  url: string;
}

// Discovers the course directories linked from the tutorial index, then
// scrapes each course's left navigation sidebar for real lesson URLs.
export const fetchW3SchoolsCatalog = async (): Promise<CatalogEntry[]> => {
  const indexHtml = await fetchHtml(`${BASE}/tutorials/index.php`);
  const $ = cheerio.load(indexHtml);

  const courses = new Map<string, string>();
  for (const slug of STATIC_SLUGS) {
    courses.set(slug, slug);
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/^\/([\w-]+)\/(?:index\.(?:php|asp|html)?)?\/?$/i);
    if (
      match &&
      !NOISE_TOPICS.has(match[1]) &&
      courses.size < MAX_COURSES
    ) {
      courses.set(match[1], match[1]);
    }
  });

  const entries: CatalogEntry[] = [];
  const seen = new Set<string>();

  for (const course of courses.keys()) {
    try {
      const html = await fetchHtml(`${BASE}/${course}/`);
      const $course = cheerio.load(html);
      const sideLinks: Array<[string, string]> = [];

      $course("a[href]").each((_, el) => {
        if (sideLinks.length >= MAX_LINKS_PER_COURSE) return;
        const href = $course(el).attr("href") ?? "";
        if (!href.includes(`${course}/`)) return;
        const title = $course(el).text().replace(/\s+/g, " ").trim();
        if (!title) return;
        if (title.length > MAX_TITLE_LENGTH) return;
        if (/powered by/i.test(title)) return;
        sideLinks.push([title, normalizeUrl(href, course)]);
      });

      for (const [title, url] of sideLinks) {
        const key = url.split("#")[0];
        if (seen.has(key)) continue;
        seen.add(key);
        entries.push({ topic: course, title, url });
      }
    } catch {
      // A failing course must not abort the whole catalog.
    }
  }

  return entries;
};

export const findW3SchoolUrl = async (keyword: string): Promise<string | null> => {
  const safe = keyword?.trim().toLowerCase();
  if (!safe) return null;

  const hit = await prisma.w3schoolsLinks.findFirst({
    where: { title: { contains: safe, mode: "insensitive" } },
    orderBy: { title: "asc" },
    select: { url: true },
  });

  return hit?.url ?? null;
};

const KEYWORD_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "in", "on", "with", "to", "at",
  "it", "is", "are", "be", "this", "that", "how", "what", "learn", "learning",
  "basics", "basic", "intro", "introduction", "guide", "tutorial", "examples",
]);

export const tokenizeKeywords = (text: string): string[] => {
  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 3 && !KEYWORD_STOPWORDS.has(t)),
    ),
  ];
};

export interface W3SchoolLink {
  title: string;
  url: string;
  topic: string;
}

export const findW3SchoolLinks = async (
  keywords: string[],
  limit = 2,
): Promise<W3SchoolLink[]> => {
  const unique = [...new Set(keywords.filter((k) => k && k.length >= 3))];
  const results: W3SchoolLink[] = [];
  const seen = new Set<string>();

  for (const keyword of unique) {
    if (results.length >= limit) break;

    const rows = await prisma.w3schoolsLinks.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { topic: { contains: keyword, mode: "insensitive" } },
        ],
      },
      take: limit - results.length + 1,
      select: { title: true, url: true, topic: true },
    });

    for (const row of rows) {
      if (results.length >= limit) break;
      if (seen.has(row.url)) continue;
      seen.add(row.url);
      results.push(row);
    }
  }

  return results;
};