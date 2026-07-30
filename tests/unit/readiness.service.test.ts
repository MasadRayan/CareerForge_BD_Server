import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { readinessService } from "../../src/module/readiness/readiness.service";

describe("readinessService.calculateScore", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("calculates composite when all components available", async () => {
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

    const expectedRecord = {
      id: "rs-1",
      user_id: "user-1",
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 71,
      composite_score: 73,
      calculated_at: new Date("2025-01-01"),
    };
    mockPrisma.readinessScores.create.mockResolvedValue(expectedRecord);

    const result = await readinessService.calculateScore("user-1");

    expect(mockPrisma.analyses.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.roadmaps.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.dailyTasks.findMany).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 71,
      composite_score: 73,
      sub_scores: { quiz_accuracy: 67, behavioral_score: 75 },
    });
  });

  it("sets ats=0 when no analysis exists", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);
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
      id: "rs-2",
      user_id: "user-1",
      ats_component: 0,
      roadmap_component: 67,
      interview_component: 71,
      composite_score: 45,
      calculated_at: new Date("2025-01-01"),
    });

    const result = await readinessService.calculateScore("user-1");

    expect(result.ats_component).toBe(0);
    expect(result.composite_score).toBe(45);
  });

  it("sets roadmap=0 when no active roadmap exists", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ ats_score: 80 });
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);
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
      id: "rs-3",
      user_id: "user-1",
      ats_component: 80,
      roadmap_component: 0,
      interview_component: 71,
      composite_score: 49,
      calculated_at: new Date("2025-01-01"),
    });

    const result = await readinessService.calculateScore("user-1");

    expect(result.roadmap_component).toBe(0);
    expect(result.composite_score).toBe(49);
    expect(mockPrisma.dailyTasks.findMany).not.toHaveBeenCalled();
  });

  it("sets interview=0 when no quiz or behavioral data exists", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ ats_score: 80 });
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "r1" });
    mockPrisma.dailyTasks.findMany.mockResolvedValue([
      { is_completed: true },
      { is_completed: true },
      { is_completed: false },
    ]);
    mockPrisma.quizAttempts.findMany.mockResolvedValue([]);
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([]);

    mockPrisma.readinessScores.create.mockResolvedValue({
      id: "rs-4",
      user_id: "user-1",
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 0,
      composite_score: 51,
      calculated_at: new Date("2025-01-01"),
    });

    const result = await readinessService.calculateScore("user-1");

    expect(result.interview_component).toBe(0);
    expect(result.sub_scores).toEqual({ quiz_accuracy: null, behavioral_score: null });
    expect(result.composite_score).toBe(51);
  });

  it("uses only behavioral score when no quiz attempts exist", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ ats_score: 80 });
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "r1" });
    mockPrisma.dailyTasks.findMany.mockResolvedValue([
      { is_completed: true },
      { is_completed: true },
      { is_completed: false },
    ]);
    mockPrisma.quizAttempts.findMany.mockResolvedValue([]);
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([
      { ai_feedback: { structure_score: 8 } },
      { ai_feedback: { structure_score: 7 } },
    ]);

    mockPrisma.readinessScores.create.mockResolvedValue({
      id: "rs-5",
      user_id: "user-1",
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 75,
      composite_score: 74,
      calculated_at: new Date("2025-01-01"),
    });

    const result = await readinessService.calculateScore("user-1");

    expect(result.sub_scores.quiz_accuracy).toBeNull();
    expect(result.sub_scores.behavioral_score).toBe(75);
    expect(result.interview_component).toBe(75);
    expect(result.composite_score).toBe(74);
  });

  it("uses only quiz accuracy when no behavioral answers exist", async () => {
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
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([]);

    mockPrisma.readinessScores.create.mockResolvedValue({
      id: "rs-6",
      user_id: "user-1",
      ats_component: 80,
      roadmap_component: 67,
      interview_component: 67,
      composite_score: 72,
      calculated_at: new Date("2025-01-01"),
    });

    const result = await readinessService.calculateScore("user-1");

    expect(result.sub_scores.quiz_accuracy).toBe(67);
    expect(result.sub_scores.behavioral_score).toBeNull();
    expect(result.interview_component).toBe(67);
    expect(result.composite_score).toBe(72);
  });
});

describe("readinessService.getHistory", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns up to 20 records ordered by calculated_at desc", async () => {
    const records = [
      {
        id: "rs-2",
        composite_score: 85,
        ats_component: 90,
        roadmap_component: 80,
        interview_component: 85,
        calculated_at: new Date("2025-02-01"),
      },
      {
        id: "rs-1",
        composite_score: 73,
        ats_component: 80,
        roadmap_component: 67,
        interview_component: 71,
        calculated_at: new Date("2025-01-01"),
      },
    ];
    mockPrisma.readinessScores.findMany.mockResolvedValue(records);

    const result = await readinessService.getHistory("user-1");

    expect(result).toHaveLength(2);
    expect(mockPrisma.readinessScores.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1" },
        orderBy: { calculated_at: "desc" },
        take: 20,
      }),
    );
    expect(result[0].calculated_at).toEqual(new Date("2025-02-01"));
    expect(result[1].calculated_at).toEqual(new Date("2025-01-01"));
  });

  it("returns empty array when no records found", async () => {
    mockPrisma.readinessScores.findMany.mockResolvedValue([]);

    const result = await readinessService.getHistory("user-1");

    expect(result).toEqual([]);
  });
});
