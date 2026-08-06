import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { jobsService } from "../../src/module/jobs/jobs.service";
import AppError from "../../src/utils/AppError";

const row = (overrides: Record<string, unknown> = {}) => ({
  id: "job-1",
  sourceJobId: "/job/details/112233",
  title: "React Developer",
  company: "Acme",
  location: "Dhaka",
  salary: null,
  jobType: null,
  category: "Engineering",
  publicationDate: null,
  deadlineDate: new Date("2026-09-01"),
  description: "Build UIs with React.",
  url: "https://bdjobs.com/job/details/112233",
  scrapedAt: new Date(),
  ...overrides,
});

describe("jobsService.searchJobs reads from BDJOBs DB catalog", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns jobs from the bdjobs_jobs table", async () => {
    mockPrisma.bdjobsJobs.findMany.mockResolvedValue([row()]);
    mockPrisma.bdjobsJobs.count.mockResolvedValue(1);

    const result = await jobsService.searchJobs("react", 1, 10);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]).toMatchObject({
      id: "job-1",
      title: "React Developer",
      company: "Acme",
      location: "Dhaka",
      url: "https://bdjobs.com/job/details/112233",
    });
    expect(result.total_jobs).toBe(1);
    expect(result.page_count).toBe(1);
  });

  it("passes pagination (skip/take) to the DB query", async () => {
    mockPrisma.bdjobsJobs.findMany.mockResolvedValue([]);
    mockPrisma.bdjobsJobs.count.mockResolvedValue(0);

    await jobsService.searchJobs("", 2, 25);

    expect(mockPrisma.bdjobsJobs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 25, take: 25 }),
    );
  });

  it("returns an empty page when no jobs are scraped yet", async () => {
    mockPrisma.bdjobsJobs.findMany.mockResolvedValue([]);
    mockPrisma.bdjobsJobs.count.mockResolvedValue(0);

    const result = await jobsService.searchJobs("data analysis", 1, 10);

    expect(result.jobs).toEqual([]);
    expect(result.total_jobs).toBe(0);
  });

  it("falls back to any-token matching when AND matching returns nothing", async () => {
    mockPrisma.bdjobsJobs.findMany
      .mockResolvedValueOnce([]) // strict AND query → empty
      .mockResolvedValueOnce([row({ title: "Data Analyst" })]); // loose OR query
    mockPrisma.bdjobsJobs.count.mockResolvedValue(0);

    const result = await jobsService.searchJobs("data analysis", 1, 10);

    expect(result.jobs.map((j) => j.title)).toEqual(["Data Analyst"]);
    expect(mockPrisma.bdjobsJobs.findMany).toHaveBeenCalledTimes(2);
  });

  it("throws 502 when the DB read fails", async () => {
    mockPrisma.bdjobsJobs.findMany.mockRejectedValue(new Error("db down"));

    await expect(
      jobsService.searchJobs("react", 1, 10),
    ).rejects.toThrow(AppError);
    await expect(
      jobsService.searchJobs("react", 1, 10),
    ).rejects.toMatchObject({ statusCode: 502 });
  });
});