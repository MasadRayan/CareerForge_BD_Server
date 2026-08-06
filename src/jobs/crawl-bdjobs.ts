import { prisma } from "../lib/prisma.js";
import { scrapeBdjobs } from "../lib/bdjobs.scraper.js";

const listingUrl = process.env.BDJOBS_LISTING_URL ?? undefined;

const run = async () => {
  try {
    const result = await scrapeBdjobs(listingUrl);
    const { entries } = result;

    if (entries.length === 0) {
      console.warn(
        "BDJOBs crawler extracted 0 jobs. The listing page may have changed or " +
          "the site challenged the crawler. Check BDJOBS_LISTING_URL or adjust " +
          "selectors in src/lib/bdjobs.scraper.ts.",
      );
      process.exit(1);
    }

    const upserts = entries.map((entry) =>
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
          scrapedAt: new Date(),
        },
      }),
    );

    await prisma.$transaction(upserts);

    // Drop listings whose application deadline has already passed.
    const pruned = await prisma.bdjobsJobs.deleteMany({
      where: { deadlineDate: { lt: new Date() } },
    });

    console.log(
      `BDJOBs crawl done: ${result.unique} unique / ${result.totalExtracted} raw ` +
        `across ${result.pages} page(s). Upserted to DB, pruned ${pruned.count} expired.`,
    );
    process.exit(0);
  } catch (error: any) {
    console.error("BDJOBs crawl failed:", error?.message ?? error);
    process.exit(1);
  }
};

void run();