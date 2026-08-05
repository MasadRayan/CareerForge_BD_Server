import { prisma } from "../lib/prisma.js";
import { fetchW3SchoolsCatalog } from "../lib/w3schools.js";

export const refreshW3SchoolsCatalog = async (): Promise<number> => {
  const entries = await fetchW3SchoolsCatalog();

  if (entries.length === 0) {
    throw new Error("W3Schools catalog fetch returned no entries");
  }

  await prisma.$transaction(async (tx) => {
    await tx.w3schoolsLinks.deleteMany({});
    await tx.w3schoolsLinks.createMany({
      data: entries.map((e) => ({ topic: e.topic, title: e.title, url: e.url })),
    });
  });

  return entries.length;
};