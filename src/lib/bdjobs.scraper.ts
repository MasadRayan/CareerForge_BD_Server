import { Builder, Browser, By, until } from "selenium-webdriver";
import { Options as ChromeOptions } from "selenium-webdriver/chrome.js";
import type { WebDriver } from "selenium-webdriver";

const DEFAULT_LISTING_URL =
  process.env.BDJOBS_LISTING_URL ?? "https://bdjobs.com/";
const MAX_PAGES = Number(process.env.BDJOBS_MAX_PAGES ?? "3");
const PAGE_DELAY_MS = Number(process.env.BDJOBS_PAGE_DELAY_MS ?? "1500");
const HEADLESS = process.env.BDJOBS_HEADLESS !== "false";
const LOAD_TIMEOUT_MS = Number(process.env.BDJOBS_LOAD_TIMEOUT_MS ?? "60000");

const BASE_URL = "https://bdjobs.com";

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
}

export interface BdjobsScrapeResult {
  totalExtracted: number;
  unique: number;
  pages: number;
  listingUrl: string;
}

const CARD_EXTRACTION_JS = `
function extractJobCards() {
  const clean = (t) => (t || "").replace(/\\s+/g, " ").trim();
  const q = (el, sels) => {
    for (const s of sels) {
      const n = el.querySelector(s);
      if (n && n.textContent.trim()) return clean(n.textContent);
    }
    return null;
  };
  const CARD_SELECTORS = [
    ".job-card", ".job-list-item", ".job-post", ".job-item",
    ".single-job", ".job_list_item", ".job-row", "[class*=joblist] [class*=job]",
  ];
  const TITLE_SELECTORS = ["[class*=title] a", "[class*=title]", "h2 a", "h3 a", "h4 a"];
  const COMPANY_SELECTORS = ["[class*=company]", "[class*=employer]"];
  const LOCATION_SELECTORS = ["[class*=location]", "[class*=address]", "[class*=area]"];
  const SALARY_SELECTORS = ["[class*=salary]", "[class*=negotiable]"];
  const DEADLINE_SELECTORS = ["[class*=deadline]", "[class*=date]", "[class*=expir]"];

  const cards = [];
  let nodes = null;
  for (const s of CARD_SELECTORS) {
    const list = document.querySelectorAll(s);
    if (list.length) { nodes = list; break; }
  }

  if (nodes && nodes.length) {
    for (const el of nodes) {
      const a = el.querySelector("a[href]");
      if (!a) continue;
      cards.push({
        title: q(el, TITLE_SELECTORS) || clean(a.textContent),
        href: a.getAttribute("href"),
        company: q(el, COMPANY_SELECTORS),
        location: q(el, LOCATION_SELECTORS),
        salary: q(el, SALARY_SELECTORS),
        deadline: q(el, DEADLINE_SELECTORS),
      });
    }
  } else {
    const seen = new Set();
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href") || "";
      if (!/job\\/details\\//i.test(href) && !/jobs\\/\\d+/i.test(href) && !/vacancy/i.test(href)) continue;
      const t = clean(a.textContent);
      if (!t || t.length < 3) continue;
      let url;
      try { url = new URL(href, window.location.href).href; } catch { continue; }
      if (seen.has(url)) continue;
      seen.add(url);
      const card = a.closest("[class*=job]") || a.closest("li,div,tr") || document.body;
      cards.push({
        title: t,
        href,
        company: q(card, COMPANY_SELECTORS),
        location: q(card, LOCATION_SELECTORS),
        salary: q(card, SALARY_SELECTORS),
        deadline: q(card, DEADLINE_SELECTORS),
      });
    }
  }
  return cards;
}
return extractJobCards();
`;

const NEXT_PAGE_JS = `
function findNextHref() {
  const sels = [".pagination .next a", ".pager-next a", "[class*=pagination] a", ".pagination a:last-child"];
  for (const s of sels) {
    const els = document.querySelectorAll(s);
    for (const el of els) {
      const text = (el.textContent || "").trim().toLowerCase();
      const cls = (el.className || "").toLowerCase();
      const href = el.getAttribute("href");
      if (href && (/next/.test(text) || /next/.test(cls) || text.includes("»") || text.includes("›"))) {
        return href;
      }
    }
  }
  return null;
}
return findNextHref();
`;

const cleanText = (value: string | null): string | null => {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned : null;
};

const normalizeHref = (href: string | null): string | null => {
  if (!href) return null;
  try {
    const url = new URL(href, BASE_URL);
    url.hash = "";
    for (const param of ["fbclid", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      url.searchParams.delete(param);
    }
    return url.href;
  } catch {
    return null;
  }
};

const sourceJobIdFromUrl = (url: string): string => {
  return new URL(url).pathname.replace(/\/+$/, "");
};

const parseDate = (value: string | null): Date | null => {
  if (!value) return null;
  const cleaned = value.replace(/deadline|expires?|last date|lastdate/gi, "").trim();
  if (!/\d/.test(cleaned)) return null;
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const detectBotBlocked = async (driver: WebDriver): Promise<boolean> => {
  try {
    const body = await driver.findElement(By.css("body")).getText();
    return /captcha|are you a robot|access denied|please verify|enable javascript/i.test(
      body.slice(0, 2000),
    );
  } catch {
    return false;
  }
};

const buildDriver = async (): Promise<WebDriver> => {
  const options = new ChromeOptions();
  options.addArguments(
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1366,900",
    "--disable-notifications",
  );
  if (HEADLESS) {
    options.addArguments("--headless=new");
  }

  return new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
};

const isCandidateCard = (entry: { title?: string | null; href?: string | null }): boolean => {
  if (!entry.href || !entry.title) return false;
  return true;
};

/**
 * Crawls a BDJOBs listing page with Selenium. Scraping runs locally (never on
 * Vercel) because a browser cannot run in serverless functions.
 */
export const scrapeBdjobs = async (
  listingUrl: string = DEFAULT_LISTING_URL,
): Promise<BdjobsScrapeResult & { entries: BdjobsScrapeEntry[] }> => {
  const driver = await buildDriver();

  const entriesMap = new Map<string, BdjobsScrapeEntry>();
  let pages = 0;
  let currentUrl = listingUrl;

  try {
    await driver.manage().setTimeouts({ pageLoad: LOAD_TIMEOUT_MS });

    for (let page = 0; page < MAX_PAGES; page += 1) {
      pages += 1;
      await driver.get(currentUrl);
      await driver.sleep(PAGE_DELAY_MS);

      if (await detectBotBlocked(driver)) {
        throw new Error(
          "BDJOBs is challenging the crawler (CAPTCHA/robot check). " +
            "Retry later or run with BDJOBS_HEADLESS=false and complete it manually.",
        );
      }

      // Wait for any known job-card selector to appear.
      let cardsFound = false;
      for (const selector of [
        ".job-card",
        ".job-list-item",
        ".job-post",
        ".single-job",
        ".job_item",
        "[class*=joblist] a[href]",
      ]) {
        try {
          await driver.wait(until.elementLocated(By.css(selector)), 15_000);
          cardsFound = true;
          break;
        } catch {
          // try the next candidate selector
        }
      }

      if (!cardsFound) {
        // Give the SPA a final settle before giving up on this page.
        await driver.sleep(5_000);
      }

      const raw: Array<{
        title?: string;
        href?: string;
        company?: string;
        location?: string;
        salary?: string;
        deadline?: string;
      }> = await driver.executeScript(CARD_EXTRACTION_JS);

      if (Array.isArray(raw)) {
        for (const item of raw) {
          if (!isCandidateCard(item)) continue;
          const url = normalizeHref(item.href ?? null);
          if (!url) continue;
          const sourceJobId = sourceJobIdFromUrl(url);
          if (entriesMap.has(sourceJobId)) continue;

          const title = cleanText(item.title ?? null);
          if (!title) continue;

          entriesMap.set(sourceJobId, {
            sourceJobId,
            title,
            company: cleanText(item.company ?? null),
            location: cleanText(item.location ?? null),
            salary: cleanText(item.salary ?? null),
            jobType: null,
            category: null,
            publicationDate: null,
            deadlineDate: parseDate(item.deadline ?? null),
            description: null,
            url,
          });
        }
      }

      const nextHref: string | null = await driver.executeScript(NEXT_PAGE_JS);
      const nextUrl = nextHref ? normalizeHref(nextHref) : null;
      if (!nextUrl) break;
      currentUrl = nextUrl;
    }
  } finally {
    await driver.quit().catch(() => {});
  }

  const entries = [...entriesMap.values()];
  return {
    totalExtracted: entries.length,
    unique: entries.length,
    pages,
    listingUrl: currentUrl,
    entries,
  };
};
