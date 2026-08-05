import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const mockAxiosGet = jest.fn();
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import { jobsService } from "../../src/module/jobs/jobs.service";

describe("jobsService.searchJobs", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  it("returns normalized jobs from Remotive", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        jobs: [
          {
            id: "job-1",
            title: "Senior React Developer",
            company_name: "Acme",
            candidate_required_location: "Worldwide",
            salary: "$100k",
            job_type: "full_time",
            publication_date: "2026-08-01T00:00:00",
            tags: ["react", "typescript"],
            url: "https://remotive.com/remote-jobs/job-1",
            description: "<p>We need <strong>React</strong> experts</p>",
          },
        ],
        "page-count": 1,
        "total-jobs": 1,
      },
    });

    const result = await jobsService.searchJobs("react", 1, 10);

    expect(result.jobs).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.jobs[0]).toMatchObject({
      id: "job-1",
      title: "Senior React Developer",
      company: "Acme",
      location: "Worldwide",
      salary: "$100k",
      tags: ["react", "typescript"],
      url: "https://remotive.com/remote-jobs/job-1",
    });
    expect(result.jobs[0].snippet).toBe("We need React experts");
  });

  it("passes the search query and category to Remotive", async () => {
    mockAxiosGet.mockResolvedValue({ data: { jobs: [] } });

    await jobsService.searchJobs("node.js", 2, 25);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      "https://remotive.com/api/remote-jobs",
      expect.objectContaining({
        params: { category: "software-dev", page: 2, limit: 25, search: "node.js" },
      }),
    );
  });

  it("returns an empty list when Remotive returns no jobs", async () => {
    mockAxiosGet.mockResolvedValue({ data: {} });

    const result = await jobsService.searchJobs("", 1, 10);

    expect(result.jobs).toEqual([]);
  });

  it("throws 502 when Remotive fails", async () => {
    mockPrisma.systemLogs.create.mockResolvedValue({});
    mockAxiosGet.mockRejectedValue(new Error("network down"));

    await expect(
      jobsService.searchJobs("react", 1, 10),
    ).rejects.toThrow("Job search is unavailable. Please try again in a moment.");
  });

  it("filters results to title-relevant jobs only", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        jobs: [
          { id: "f1", title: "Tech Lead Full-Stack Rails Engineer", company_name: "A", description: "<p>x</p>" },
          { id: "f2", title: "Senior Product Engineer (Fullstack)", company_name: "B", description: "<p>x</p>" },
          { id: "f3", title: "Freelance Copywriter", company_name: "C", description: "<p>x</p>" },
          { id: "f4", title: "Senior Graphic Designer", company_name: "D", description: "<p>x</p>" },
        ],
      },
    });

    const result = await jobsService.searchJobs("Full Stack Developer", 1, 10);

    expect(result.jobs.map((j) => j.id)).toEqual(["f1", "f2"]);
  });

  it("matches fullstack variants regardless of separator", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        jobs: [
          { id: "a", title: "Fullstack Developer", company_name: "A", description: "" },
          { id: "b", title: "Full-Stack Developer", company_name: "B", description: "" },
          { id: "c", title: "Full Stack Engineer", company_name: "C", description: "" },
          { id: "d", title: "Data Entry Specialist", company_name: "D", description: "" },
        ],
      },
    });

    const result = await jobsService.searchJobs("full stack developer", 1, 10);

    expect(result.jobs.map((j) => j.id)).toEqual(["a", "b", "c"]);
  });
});