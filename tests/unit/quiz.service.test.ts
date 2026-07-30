import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { sampleQuizQuestion, sampleQuizQuestions } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { quizService } from "../../src/module/quiz/quiz.service";

describe("quizService.getQuestionsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns paginated questions", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(sampleQuizQuestions);
    mockPrisma.quizQuestions.count.mockResolvedValue(sampleQuizQuestions.length);

    const result = await quizService.getQuestionsFromDB({ page: 1, limit: 10 });

    expect(result.questions).toHaveLength(3);
    expect(result.pagination.totalItems).toBe(3);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it("filters by role_category", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(
      sampleQuizQuestions.filter((q) => q.role_category === "frontend"),
    );
    mockPrisma.quizQuestions.count.mockResolvedValue(2);

    const result = await quizService.getQuestionsFromDB({
      role_category: "frontend",
      page: 1,
      limit: 10,
    });

    expect(result.questions).toHaveLength(2);
    expect(mockPrisma.quizQuestions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role_category: "frontend" }),
      }),
    );
  });

  it("filters by difficulty", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue(
      sampleQuizQuestions.filter((q) => q.difficulty === "easy"),
    );
    mockPrisma.quizQuestions.count.mockResolvedValue(3);

    const result = await quizService.getQuestionsFromDB({
      difficulty: "easy",
      page: 1,
      limit: 10,
    });

    expect(result.questions).toHaveLength(3);
    expect(mockPrisma.quizQuestions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ difficulty: "easy" }),
      }),
    );
  });

  it("strips correct_answer from response", async () => {
    mockPrisma.quizQuestions.findMany.mockResolvedValue([sampleQuizQuestion]);
    mockPrisma.quizQuestions.count.mockResolvedValue(1);

    const result = await quizService.getQuestionsFromDB({ page: 1, limit: 10 });

    expect(result.questions[0]).not.toHaveProperty("correct_answer");
  });

  it("paginates correctly", async () => {
    const manyQuestions = Array.from({ length: 25 }, (_, i) => ({
      ...sampleQuizQuestion,
      id: `q-${i + 1}`,
    }));
    mockPrisma.quizQuestions.findMany.mockResolvedValue(manyQuestions.slice(0, 10));
    mockPrisma.quizQuestions.count.mockResolvedValue(25);

    const result = await quizService.getQuestionsFromDB({ page: 1, limit: 10 });

    expect(result.questions).toHaveLength(10);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it("rejects invalid role_category", async () => {
    await expect(
      quizService.getQuestionsFromDB({
        role_category: "invalid-role",
        page: 1,
        limit: 10,
      }),
    ).rejects.toThrow(/Invalid role_category/);
  });

  it("rejects invalid difficulty", async () => {
    await expect(
      quizService.getQuestionsFromDB({
        // @ts-expect-error testing invalid input
        difficulty: "extreme",
        page: 1,
        limit: 10,
      }),
    ).rejects.toThrow(/Invalid difficulty/);
  });
});

describe("quizService.submitAttemptToDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns correct when selected_answer matches", async () => {
    mockPrisma.quizQuestions.findUnique.mockResolvedValue({
      id: "q-1",
      correct_answer: "a",
    });
    mockPrisma.quizAttempts.create.mockResolvedValue({
      id: "attempt-1",
      question_id: "q-1",
      selected_answer: "a",
      is_correct: true,
      attempted_at: new Date(),
    });

    const result = await quizService.submitAttemptToDB("user-1", {
      question_id: "q-1",
      selected_answer: "a",
    });

    expect(result.is_correct).toBe(true);
  });

  it("returns incorrect when selected_answer does not match", async () => {
    mockPrisma.quizQuestions.findUnique.mockResolvedValue({
      id: "q-1",
      correct_answer: "b",
    });
    mockPrisma.quizAttempts.create.mockResolvedValue({
      id: "attempt-2",
      question_id: "q-1",
      selected_answer: "a",
      is_correct: false,
      attempted_at: new Date(),
    });

    const result = await quizService.submitAttemptToDB("user-1", {
      question_id: "q-1",
      selected_answer: "a",
    });

    expect(result.is_correct).toBe(false);
  });

  it("throws 404 for non-existent question", async () => {
    mockPrisma.quizQuestions.findUnique.mockResolvedValue(null);

    await expect(
      quizService.submitAttemptToDB("user-1", {
        question_id: "nonexistent",
        selected_answer: "a",
      }),
    ).rejects.toThrow("Question not found");
  });
});

describe("quizService.getStatsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns zero stats when no attempts exist", async () => {
    mockPrisma.quizAttempts.findMany.mockResolvedValue([]);

    const result = await quizService.getStatsFromDB("user-1");

    expect(result.total_attempted).toBe(0);
    expect(result.correct).toBe(0);
    expect(result.accuracy_percent).toBe(0);
  });

  it("calculates accuracy correctly", async () => {
    mockPrisma.quizAttempts.findMany.mockResolvedValue([
      { is_correct: true, question: { difficulty: "easy" } },
      { is_correct: true, question: { difficulty: "easy" } },
      { is_correct: false, question: { difficulty: "medium" } },
      { is_correct: true, question: { difficulty: "hard" } },
    ]);

    const result = await quizService.getStatsFromDB("user-1");

    expect(result.total_attempted).toBe(4);
    expect(result.correct).toBe(3);
    expect(result.accuracy_percent).toBe(75);
  });

  it("breaks down by difficulty", async () => {
    mockPrisma.quizAttempts.findMany.mockResolvedValue([
      { is_correct: true, question: { difficulty: "easy" } },
      { is_correct: false, question: { difficulty: "easy" } },
      { is_correct: true, question: { difficulty: "medium" } },
      { is_correct: false, question: { difficulty: "hard" } },
    ]);

    const result = await quizService.getStatsFromDB("user-1");

    expect(result.by_difficulty.easy).toEqual({ attempted: 2, correct: 1 });
    expect(result.by_difficulty.medium).toEqual({ attempted: 1, correct: 1 });
    expect(result.by_difficulty.hard).toEqual({ attempted: 1, correct: 0 });
  });
});

describe("quizService.getAttemptHistoryFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns empty array when no history", async () => {
    mockPrisma.quizAttempts.findMany.mockResolvedValue([]);

    const result = await quizService.getAttemptHistoryFromDB("user-1");

    expect(result).toEqual([]);
  });

  it("returns history with question details", async () => {
    mockPrisma.quizAttempts.findMany.mockResolvedValue([
      {
        id: "attempt-1",
        selected_answer: "a",
        is_correct: true,
        attempted_at: new Date("2025-01-01"),
        question: {
          id: "q-1",
          question_text: "What does HTML stand for?",
          correct_answer: "a",
          difficulty: "easy",
          role_category: "frontend",
        },
      },
    ]);

    const result = await quizService.getAttemptHistoryFromDB("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].question.question_text).toBe("What does HTML stand for?");
  });
});
