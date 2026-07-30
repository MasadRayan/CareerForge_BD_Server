import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (_req: any, _res: any, next: any) => {
    _req.user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "free_user",
    };
    next();
  },
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));
jest.mock("../../src/lib/urlValidator", () => ({
  verifyResources: jest.fn(),
}));
jest.mock("../../src/lib/searchFallback", () => ({
  getFallbackUrl: jest.fn(),
}));

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");
const { verifyResources } = jest.requireMock("../../src/lib/urlValidator");

import { roadmapRouter } from "../../src/module/roadmap/roadmap.route";

const app = createTestApp("/api/roadmap", roadmapRouter);
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
};
app.use(errorHandler);

const mockGroqResponse = JSON.stringify({
  weeks: [
    {
      week_number: 1,
      topic_summary: "Introduction to Skill Building",
      resources: [
        { title: "Getting Started Guide", url: "https://example.com/start", type: "article" as const },
        { title: "Practice Basics", url: "https://example.com/practice", type: "video" as const },
      ],
      daily_tasks: [
        "Read the guide",
        "Practice exercises",
        "Review concepts",
        "Build a project",
        "Take notes",
      ],
    },
  ],
});

const mockCreatedRoadmap = {
  id: "roadmap-1",
  analysis_id: "analysis-1",
  user_id: "user-1",
  duration_weeks: 4,
  status: "active",
  created_at: new Date().toISOString(),
  weeks: [
    {
      id: "week-1",
      roadmap_id: "roadmap-1",
      week_number: 1,
      topic_summary: "Introduction to Skill Building",
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      resources: [
        { id: "res-1", week_id: "week-1", title: "Getting Started Guide", url: "https://example.com/start", type: "article" as const },
        { id: "res-2", week_id: "week-1", title: "Practice Basics", url: "https://example.com/practice", type: "video" as const },
      ],
      dailyTasks: [
        { id: "task-1", week_id: "week-1", description: "Read the guide", is_completed: false, completed_at: null },
        { id: "task-2", week_id: "week-1", description: "Practice exercises", is_completed: false, completed_at: null },
        { id: "task-3", week_id: "week-1", description: "Review concepts", is_completed: false, completed_at: null },
        { id: "task-4", week_id: "week-1", description: "Build a project", is_completed: false, completed_at: null },
        { id: "task-5", week_id: "week-1", description: "Take notes", is_completed: false, completed_at: null },
      ],
    },
  ],
};

const mockRoadmapList = [
  { id: "roadmap-1", analysis_id: "analysis-1", duration_weeks: 4, status: "active", created_at: new Date().toISOString() },
];

describe("POST /api/roadmap", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 201 and creates a roadmap", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({
      id: "analysis-1",
      gap_skills: ["python", "docker"],
      jd: { interview_date: null },
    });
    groqChatCompletion.mockResolvedValue(mockGroqResponse);
    verifyResources.mockResolvedValue({ valid: [{ title: "Getting Started Guide", url: "https://example.com/start", type: "article" }], invalid: [] });
    mockPrisma.roadmaps.create.mockResolvedValue(mockCreatedRoadmap);

    const res = await request(app)
      .post("/api/roadmap")
      .send({ analysis_id: "analysis-1" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Roadmap generated successfully");
    expect(res.body.data.id).toBe("roadmap-1");
  });

  it("returns 400 when analysis_id is missing", async () => {
    const res = await request(app)
      .post("/api/roadmap")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/roadmap", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a list of roadmaps", async () => {
    mockPrisma.roadmaps.findMany.mockResolvedValue(mockRoadmapList);

    const res = await request(app).get("/api/roadmap");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("roadmap-1");
  });
});

describe("GET /api/roadmap/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a single roadmap", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockCreatedRoadmap);

    const res = await request(app).get("/api/roadmap/roadmap-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("roadmap-1");
    expect(res.body.data.weeks).toHaveLength(1);
  });

  it("returns 404 when roadmap is not found", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);

    const res = await request(app).get("/api/roadmap/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Roadmap not found");
  });
});

describe("PATCH /api/roadmap/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 and updates status", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockPrisma.roadmaps.update.mockResolvedValue({
      id: "roadmap-1",
      analysis_id: "analysis-1",
      user_id: "user-1",
      duration_weeks: 4,
      status: "completed",
      created_at: new Date(),
    });

    const res = await request(app)
      .patch("/api/roadmap/roadmap-1")
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("completed");
  });
});

describe("PATCH /api/roadmap/:id/tasks/:taskId", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 and completes a task", async () => {
    mockPrisma.dailyTasks.findFirst.mockResolvedValue({
      id: "task-1",
      week_id: "week-1",
      description: "Read the guide",
      is_completed: false,
      completed_at: null,
    });
    mockPrisma.dailyTasks.update.mockResolvedValue({
      id: "task-1",
      week_id: "week-1",
      description: "Read the guide",
      is_completed: true,
      completed_at: new Date(),
    });
    mockPrisma.streaks.findUnique.mockResolvedValue(null);
    mockPrisma.streaks.upsert.mockResolvedValue({
      user_id: "user-1",
      current_streak: 1,
      longest_streak: 1,
      last_active_date: new Date(),
    });

    const res = await request(app).patch("/api/roadmap/roadmap-1/tasks/task-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Task marked complete");
    expect(res.body.data.is_completed).toBe(true);
  });
});

describe("DELETE /api/roadmap/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 and deletes a roadmap", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockPrisma.roadmaps.delete.mockResolvedValue({ id: "roadmap-1" });

    const res = await request(app).delete("/api/roadmap/roadmap-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Roadmap deleted successfully");
  });
});
