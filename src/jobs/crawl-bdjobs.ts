import { prisma } from "../lib/prisma.js";
import { scrapeBdjobs } from "../lib/bdjobs.scraper.js";

const TITLES = [
  "React Developer",
  "Full Stack Developer",
  "Backend Developer",
  "Node.js Developer",
  "Software Engineer",
  "Frontend Developer",
  "Data Analyst",
  "UI/UX Designer",
];

const MAX_PAGES = Number(process.env.BDJOBS_MAX_PAGES ?? "3");

const UPSERT_CHUNK = 10;

const upsertEntries = async (entries: Awaited<ReturnType<typeof scrapeBdjobs>>["entries"]) => {
  if (entries.length === 0) return 0;

  let saved = 0;
  for (let i = 0; i < entries.length; i += UPSERT_CHUNK) {
    const chunk = entries.slice(i, i + UPSERT_CHUNK);

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

  return saved;
};

const run = async () => {
  const args = process.argv.slice(2);
  const titles = args.length > 0 ? args : TITLES;

  const results: Array<{ searchTerm: string; saved: number }> = [];

  try {
    for (const title of titles) {
      console.log(`Crawling: ${title}`);
      const result = await scrapeBdjobs(title, MAX_PAGES);
      const saved = await upsertEntries(result.entries);
      results.push({ searchTerm: title, saved });
      console.log(`  → ${saved} saved for "${title}" (${result.pages} page(s))`);
    }

    // Drop listings whose application deadline has already passed.
    const pruned = await prisma.bdjobsJobs.deleteMany({
      where: { deadlineDate: { lt: new Date() } },
    });

    console.log(
      `BDJOBs crawl done: ${results.reduce((sum, r) => sum + r.saved, 0)} total saved, ` +
        `pruned ${pruned.count} expired.`,
    );
    process.exit(0);
  } catch (error: any) {
    console.error("BDJOBs crawl failed:", error?.message ?? error);
    process.exit(1);
  }
};

void run();
