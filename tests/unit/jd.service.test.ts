import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { sampleUser } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { jobDescriptionService } from "../../src/module/jobDescription/jobDescription.service";
import AppError from "../../src/utils/AppError";

const mockJobDescription = {
  id: "jd-1",
  title: "Software Engineer",
  raw_text: "We are looking for a skilled software engineer...",
  interview_date: null,
  user_id: sampleUser.id,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
};

describe("jobDescriptionService.createJobDescriptionIntoDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("creates a job description with required fields", async () => {
    mockPrisma.jobDescriptions.create.mockResolvedValue(mockJobDescription);

    const result = await jobDescriptionService.createJobDescriptionIntoDB(sampleUser.id, {
      title: "Software Engineer",
      raw_text: "We are looking for a skilled software engineer...",
    });

    expect(result).toEqual(mockJobDescription);
    expect(mockPrisma.jobDescriptions.create).toHaveBeenCalledWith({
      data: {
        title: "Software Engineer",
        raw_text: "We are looking for a skilled software engineer...",
        user_id: sampleUser.id,
        interview_date: null,
      },
    });
  });

  it("creates a job description with interview_date parsed", async () => {
    const jdWithDate = {
      ...mockJobDescription,
      interview_date: new Date("2025-06-15"),
    };
    mockPrisma.jobDescriptions.create.mockResolvedValue(jdWithDate);

    const result = await jobDescriptionService.createJobDescriptionIntoDB(sampleUser.id, {
      title: "Software Engineer",
      raw_text: "We are looking for a skilled software engineer...",
      interview_date: "2025-06-15",
    });

    expect(result.interview_date).toEqual(new Date("2025-06-15"));
    expect(mockPrisma.jobDescriptions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        interview_date: new Date("2025-06-15"),
      }),
    });
  });
});

describe("jobDescriptionService.getAllJobDescriptionsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a list of job descriptions", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ id: sampleUser.id });
    mockPrisma.jobDescriptions.findMany.mockResolvedValue([mockJobDescription]);

    const result = await jobDescriptionService.getAllJobDescriptionsFromDB(sampleUser.id);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockJobDescription);
    expect(mockPrisma.jobDescriptions.findMany).toHaveBeenCalledWith({
      where: { user_id: sampleUser.id },
      orderBy: { created_at: "desc" },
    });
  });

  it("throws 404 when user does not exist", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      jobDescriptionService.getAllJobDescriptionsFromDB(sampleUser.id),
    ).rejects.toThrow(new AppError("User not found", 404));
  });
});

describe("jobDescriptionService.getASingleJobDescription", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a single job description", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);

    const result = await jobDescriptionService.getASingleJobDescription(sampleUser.id, "jd-1");

    expect(result).toEqual(mockJobDescription);
    expect(mockPrisma.jobDescriptions.findFirst).toHaveBeenCalledWith({
      where: { id: "jd-1", user_id: sampleUser.id },
    });
  });

  it("throws 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    await expect(
      jobDescriptionService.getASingleJobDescription(sampleUser.id, "nonexistent"),
    ).rejects.toThrow(new AppError("Job description not found", 404));
  });
});

describe("jobDescriptionService.updateASingleJobDescriptionInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("updates a job description", async () => {
    const updated = { ...mockJobDescription, title: "Senior Software Engineer" };
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);
    mockPrisma.jobDescriptions.update.mockResolvedValue(updated);

    const result = await jobDescriptionService.updateASingleJobDescriptionInDB(
      sampleUser.id,
      "jd-1",
      { title: "Senior Software Engineer" },
    );

    expect(result.title).toBe("Senior Software Engineer");
    expect(mockPrisma.jobDescriptions.update).toHaveBeenCalledWith({
      where: { id: "jd-1" },
      data: { title: "Senior Software Engineer", raw_text: undefined, interview_date: undefined },
    });
  });

  it("throws 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    await expect(
      jobDescriptionService.updateASingleJobDescriptionInDB(sampleUser.id, "nonexistent", {
        title: "New Title",
      }),
    ).rejects.toThrow(new AppError("Job description not found", 404));
  });
});

describe("jobDescriptionService.deleteAJobDescriptionFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("deletes a job description", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);
    mockPrisma.jobDescriptions.delete.mockResolvedValue(mockJobDescription);

    await jobDescriptionService.deleteAJobDescriptionFromDB(sampleUser.id, "jd-1");

    expect(mockPrisma.jobDescriptions.delete).toHaveBeenCalledWith({
      where: { id: "jd-1" },
    });
  });

  it("throws 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    await expect(
      jobDescriptionService.deleteAJobDescriptionFromDB(sampleUser.id, "nonexistent"),
    ).rejects.toThrow(new AppError("Job description not found", 404));
  });
});
