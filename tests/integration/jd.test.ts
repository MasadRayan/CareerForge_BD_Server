import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";
import globalHandler from "../../src/middleware/globalErrorHandler.js";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (req: any, _res: any, next: any) => {
    req.user = { id: "user-1", name: "Test User", email: "test@example.com", role: "free_user" };
    next();
  },
}));

import { jobDescriptionRouter } from "../../src/module/jobDescription/jobDescription.route";

const app = createTestApp("/api/job-description", jobDescriptionRouter);
app.use(globalHandler);

const mockJobDescription = {
  id: "jd-1",
  title: "Software Engineer",
  raw_text: "We are looking for a skilled software engineer...",
  interview_date: null,
  user_id: "user-1",
  created_at: new Date("2025-01-01").toISOString(),
  updated_at: new Date("2025-01-01").toISOString(),
};

describe("POST /api/job-description", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 201 and creates a job description", async () => {
    mockPrisma.jobDescriptions.create.mockResolvedValue(mockJobDescription);

    const res = await request(app)
      .post("/api/job-description")
      .send({ title: "Software Engineer", raw_text: "We are looking for a skilled software engineer..." });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Software Engineer");
  });
});

describe("GET /api/job-description", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a list of job descriptions", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ id: "user-1" });
    mockPrisma.jobDescriptions.findMany.mockResolvedValue([mockJobDescription]);

    const res = await request(app).get("/api/job-description");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Software Engineer");
  });
});

describe("GET /api/job-description/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with the job description", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);

    const res = await request(app).get("/api/job-description/jd-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("jd-1");
  });

  it("returns 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    const res = await request(app).get("/api/job-description/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("PATCH /api/job-description/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with the updated job description", async () => {
    const updated = { ...mockJobDescription, title: "Senior Software Engineer" };
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);
    mockPrisma.jobDescriptions.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/job-description/jd-1")
      .send({ title: "Senior Software Engineer" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Senior Software Engineer");
  });

  it("returns 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/job-description/nonexistent")
      .send({ title: "New Title" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/job-description/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 on successful deletion", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJobDescription);
    mockPrisma.jobDescriptions.delete.mockResolvedValue(mockJobDescription);

    const res = await request(app).delete("/api/job-description/jd-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Job description deleted successfully");
  });

  it("returns 404 when job description is not found", async () => {
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    const res = await request(app).delete("/api/job-description/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
