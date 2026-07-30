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

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

import { behavioralRouter } from "../../src/module/behavioral/behavioral.route";

const app = createTestApp("/api/behavioral", behavioralRouter);
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
};
app.use(errorHandler);

const mockQuestions = [
  { id: "bq-1", question_text: "Tell me about a time you led a team", category: "leadership" },
  { id: "bq-2", question_text: "Describe a conflict you resolved", category: "teamwork" },
];

const mockGroqFeedback = JSON.stringify({
  structure_score: 8,
  star_adherence: "good",
  strengths: ["clear"],
  suggestions: ["be specific"],
  improved_example: "Example answer",
});

const mockAnswerResult = {
  id: "ans-1",
  question_id: "bq-1",
  answer_text: "I led a team of 5 engineers...",
  ai_feedback: {
    structure_score: 8,
    star_adherence: "good",
    strengths: ["clear"],
    suggestions: ["be specific"],
    improved_example: "Example answer",
  },
  answered_at: new Date().toISOString(),
};

const mockAnswerWithQuestion = {
  id: "ans-1",
  question_id: "bq-1",
  answer_text: "I led a team of 5 engineers...",
  ai_feedback: {
    structure_score: 8,
    star_adherence: "good",
    strengths: ["clear"],
    suggestions: ["be specific"],
    improved_example: "Example answer",
  },
  answered_at: new Date().toISOString(),
  question: {
    question_text: "Tell me about a time you led a team",
    category: "leadership",
  },
};

describe("GET /api/behavioral", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with paginated questions", async () => {
    mockPrisma.behavioralQuestions.findMany.mockResolvedValue(mockQuestions);
    mockPrisma.behavioralQuestions.count.mockResolvedValue(mockQuestions.length);

    const res = await request(app).get("/api/behavioral");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toHaveLength(2);
    expect(res.body.data.pagination).toBeDefined();
  });

  it("filters questions by category query param", async () => {
    const filtered = [mockQuestions[0]];
    mockPrisma.behavioralQuestions.findMany.mockResolvedValue(filtered);
    mockPrisma.behavioralQuestions.count.mockResolvedValue(filtered.length);

    const res = await request(app).get("/api/behavioral?category=leadership");

    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(1);
    expect(res.body.data.questions[0].category).toBe("leadership");
  });
});

describe("GET /api/behavioral/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a single question", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(mockQuestions[0]);

    const res = await request(app).get("/api/behavioral/bq-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("bq-1");
  });

  it("returns 404 when question is not found", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/behavioral/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/behavioral/:id/answer", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 201 when answer is submitted successfully", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(mockQuestions[0]);
    groqChatCompletion.mockResolvedValue(mockGroqFeedback);
    mockPrisma.behavioralAnswers.create.mockResolvedValue(mockAnswerResult);

    const res = await request(app)
      .post("/api/behavioral/bq-1/answer")
      .send({ answer_text: "I led a team of 5 engineers..." });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("ans-1");
    expect(res.body.data.ai_feedback.structure_score).toBe(8);
  });

  it("returns 422 when body is invalid", async () => {
    const res = await request(app)
      .post("/api/behavioral/bq-1/answer")
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when question does not exist", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/behavioral/nonexistent/answer")
      .send({ answer_text: "My answer" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/behavioral/answers", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with answers list", async () => {
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([mockAnswerWithQuestion]);

    const res = await request(app).get("/api/behavioral/answers");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].question_text).toBe("Tell me about a time you led a team");
  });
});
