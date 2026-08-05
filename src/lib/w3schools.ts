import * as cheerio from "cheerio";
import { prisma } from "./prisma.js";

const BASE = "https://www.w3schools.com";
const UA = "Mozilla/5.0 (compatible; CareerForgeBD/1.0)";

const MAX_COURSES = 30;
const MAX_LINKS_PER_COURSE = 120;

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
  if (trimmed.startsWith("http")) return trimmed;
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
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/^\/([\w-]+)\/(?:index\.(?:php|asp|html)?)?$/i);
    if (match && courses.size < MAX_COURSES) {
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