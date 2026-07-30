import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";
import { sampleQuizQuestions } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (_req: any, _res: any, next: any) => {
    _req.user = { id: "user-1", name: "Test User", email: "test@example.com", role: "free_user" };
    next();
  },
}));

import { quizRouter } from "../../src/module/quiz/quiz.route";

const app = createTestApp("/api/quiz", quizRouter);

describe("GET /api/quiz", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with questions", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(sampleQuizQuestions);
    mockPrisma.quizQuestions.count.mockResolvedValue(sampleQuizQuestions.length);

    const res = await request(app).get("/api/quiz");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toHaveLength(3);
  });

  it("filters by role_category query param", async () => {
    const filtered = sampleQuizQuestions.filter(
      (q) => q.role_category === "frontend",
    );
    mockPrisma.quizQuestions.findMany.mockResolvedValue(filtered);
    mockPrisma.quizQuestions.count.mockResolvedValue(filtered.length);

    const res = await request(app).get("/api/quiz?role_category=frontend");

    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(2);
  });

  it("filters by difficulty query param", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(sampleQuizQuestions);
    mockPrisma.quizQuestions.count.mockResolvedValue(sampleQuizQuestions.length);

    const res = await request(app).get("/api/quiz?difficulty=easy");

    expect(res.status).toBe(200);
  });

  it("does not return correct_answer in response", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(sampleQuizQuestions);
    mockPrisma.quizQuestions.count.mockResolvedValue(sampleQuizQuestions.length);

    const res = await request(app).get("/api/quiz");

    expect(res.body.data.questions[0]).not.toHaveProperty("correct_answer");
  });
});

describe("POST /api/quiz/attempt", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with correct result", async () => {
    const qId = "550e8400-e29b-41d4-a716-446655440001";
    mockPrisma.quizQuestions.findUnique.mockResolvedValue({
      id: qId,
      correct_answer: "a",
    });
    mockPrisma.quizAttempts.create.mockResolvedValue({
      id: "attempt-1",
      question_id: qId,
      selected_answer: "a",
      is_correct: true,
      attempted_at: new Date(),
    });

    const res = await request(app)
      .post("/api/quiz/attempt")
      .send({ question_id: qId, selected_answer: "a" });

    expect(res.status).toBe(200);
    expect(res.body.data.is_correct).toBe(true);
  });

  it("returns 200 with incorrect result", async () => {
    const qId = "550e8400-e29b-41d4-a716-446655440002";
    mockPrisma.quizQuestions.findUnique.mockResolvedValue({
      id: qId,
      correct_answer: "b",
    });
    mockPrisma.quizAttempts.create.mockResolvedValue({
      id: "attempt-2",
      question_id: qId,
      selected_answer: "a",
      is_correct: false,
      attempted_at: new Date(),
    });

    const res = await request(app)
      .post("/api/quiz/attempt")
      .send({ question_id: qId, selected_answer: "a" });

    expect(res.status).toBe(200);
    expect(res.body.data.is_correct).toBe(false);
  });

  it("returns 422 for missing question_id", async () => {
    const res = await request(app)
      .post("/api/quiz/attempt")
      .send({ selected_answer: "a" });

    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid selected_answer", async () => {
    const res = await request(app)
      .post("/api/quiz/attempt")
      .send({
        question_id: "550e8400-e29b-41d4-a716-446655440001",
        selected_answer: "e",
      });

    expect(res.status).toBe(422);
  });
});
