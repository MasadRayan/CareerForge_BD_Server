import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";
import { sampleUser } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (req: any, _res: any, next: any) => {
    req.user = { id: sampleUser.id, name: sampleUser.name, email: sampleUser.email, role: sampleUser.role };
    req.decoded = { email: sampleUser.email };
    next();
  },
}));

import { readinessRouter } from "../../src/module/readiness/readiness.route";

const app = createTestApp("/api/readiness", readinessRouter);

describe("GET /api/readiness", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with calculated score", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ ats_score: 80 });
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "r1" });
    mockPrisma.dailyTasks.findMany.mockResolvedValue([
      { is_completed: true },
      { is_completed: true },
      { is_completed: false },
    ]);
    mockPrisma.quizAttempts.findMany.mockResolvedValue([
      { is_correct: true },
      { is_correct: false },
      { is_correct: true },
    ]);
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([
      { ai_feedback: { structure_score: 8 } },
      { ai_feedback: { structure_score: 7 } },
    ]);
    mockPrisma.readinessScores.create.mockResolvedValue({
      id: "rs-1",
      user_id: sampleUser.id,
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 71,
      composite_score: 73,
      calculated_at: new Date("2025-01-01"),
    });

    const res = await request(app).get("/api/readiness");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.composite_score).toBe(73);
    expect(res.body.data.sub_scores).toEqual({
      quiz_accuracy: 67,
      behavioral_score: 75,
    });
  });

  it("returns 200 with all zero components when no data exists", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);
    mockPrisma.quizAttempts.findMany.mockResolvedValue([]);
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([]);
    mockPrisma.readinessScores.create.mockResolvedValue({
      id: "rs-0",
      user_id: sampleUser.id,
      ats_component: 0,
      roadmap_component: 0,
      interview_component: 0,
      composite_score: 0,
      calculated_at: new Date("2025-01-01"),
    });

    const res = await request(app).get("/api/readiness");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.composite_score).toBe(0);
    expect(res.body.data.ats_component).toBe(0);
    expect(res.body.data.roadmap_component).toBe(0);
    expect(res.body.data.interview_component).toBe(0);
    expect(res.body.data.sub_scores).toEqual({
      quiz_accuracy: null,
      behavioral_score: null,
    });
  });
});

describe("GET /api/readiness/history", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with history list", async () => {
    const records = [
      {
        id: "rs-2",
        composite_score: 85,
        ats_component: 90,
        roadmap_component: 80,
        interview_component: 85,
        calculated_at: new Date("2025-02-01").toISOString(),
      },
      {
        id: "rs-1",
        composite_score: 73,
        ats_component: 80,
        roadmap_component: 67,
        interview_component: 71,
        calculated_at: new Date("2025-01-01").toISOString(),
      },
    ];
    mockPrisma.readinessScores.findMany.mockResolvedValue(records);

    const res = await request(app).get("/api/readiness/history");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.message).toBe("Fetched 2 record(s) successfully");
  });

  it("returns 200 with empty array when no history", async () => {
    mockPrisma.readinessScores.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/readiness/history");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toBe("Fetched 0 record(s) successfully");
  });
});
