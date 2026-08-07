import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));

import { roadmapTestService } from "../../src/module/roadmap/roadmap.test.service";

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

const mockRoadmap = {
  id: "roadmap-1",
  user_id: "user-1",
  weeks: [
    {
      id: "week-1",
      week_number: 1,
      topic_summary: "Introduction to Skill Building",
      is_unlocked: true,
      dailyTasks: [
        { is_completed: true },
        { is_completed: true },
        { is_completed: true },
        { is_completed: true },
        { is_completed: true },
      ],
      resources: [{ title: "Getting Started Guide" }],
    },
    {
      id: "week-2",
      week_number: 2,
      topic_summary: "Intermediate Concepts",
      is_unlocked: false,
      dailyTasks: [
        { is_completed: false },
        { is_completed: false },
        { is_completed: false },
        { is_completed: false },
        { is_completed: false },
      ],
      resources: [],
    },
  ],
  analysis: { gap_skills: ["python"] },
};

const mockQuestions = [
  {
    id: "q-1",
    question_text: "What does REST stand for?",
    options: { a: "one", b: "two", c: "three", d: "four" },
    correct_answer: "b",
    difficulty: "easy",
  },
  {
    id: "q-2",
    question_text: "HTTP status for created?",
    options: { a: "one", b: "two", c: "three", d: "four" },
    correct_answer: "c",
    difficulty: "medium",
  },
];

// Groq returns the correct answer as the exact option TEXT.
const mockGroqQuestions = [
  {
    question_text: "What does REST stand for?",
    options: { a: "one", b: "two", c: "three", d: "four" },
    correct_answer: "two",
    difficulty: "easy",
  },
  {
    question_text: "HTTP status for created?",
    options: { a: "one", b: "two", c: "three", d: "four" },
    correct_answer: "three",
    difficulty: "medium",
  },
  {
    question_text: "Which is a valid HTTP verb?",
    options: { a: "one", b: "two", c: "three", d: "four" },
    correct_answer: "four",
    difficulty: "medium",
  },
];

const mockTest = {
  id: "test-1",
  roadmap_week_id: "week-1",
  pass_score: 60,
  questions: mockQuestions,
};

describe("roadmapTestService.getWeekTestFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    groqChatCompletion.mockReset();
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockRoadmap);
  });

  it("throws 404 when roadmap is not owned", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);

    await expect(
      roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-1"),
    ).rejects.toThrow("Roadmap not found or not owned by you");
  });

  it("throws 403 when the week is locked", async () => {
    await expect(
      roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-2"),
    ).rejects.toThrow("Week 2 is locked");
  });

  it("throws 409 when daily tasks are incomplete", async () => {
    const roadmap = {
      ...mockRoadmap,
      weeks: [
        {
          ...mockRoadmap.weeks[0],
          is_unlocked: true,
          dailyTasks: [{ is_completed: true }, { is_completed: false }],
        },
      ],
    };
    mockPrisma.roadmaps.findFirst.mockResolvedValue(roadmap);

    await expect(
      roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-1"),
    ).rejects.toThrow("Complete all daily tasks");
  });

  it("returns test questions without the correct answer", async () => {
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(mockTest);

    const result = await roadmapTestService.getWeekTestFromDB(
      "user-1",
      "roadmap-1",
      "week-1",
    );

    expect(result.test_id).toBe("test-1");
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]).not.toHaveProperty("correct_answer");
    expect(result.already_passed).toBe(false);
  });

  it("lazy-generates a test when missing", async () => {
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(null);
    groqChatCompletion.mockResolvedValue(JSON.stringify({ questions: mockGroqQuestions }));
    mockPrisma.roadmapWeekTests.create.mockResolvedValue(mockTest);

    const result = await roadmapTestService.getWeekTestFromDB(
      "user-1",
      "roadmap-1",
      "week-1",
    );

    expect(groqChatCompletion).toHaveBeenCalled();
    expect(mockPrisma.roadmapWeekTests.create).toHaveBeenCalled();
    expect(result.questions).toHaveLength(2);
  });

  it("reconciles correct_answer TEXT back to the matching option letter", async () => {
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(null);
    groqChatCompletion.mockResolvedValue(JSON.stringify({ questions: mockGroqQuestions }));
    mockPrisma.roadmapWeekTests.create.mockResolvedValue(mockTest);

    await roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-1");

    const createArg = mockPrisma.roadmapWeekTests.create.mock.calls[0][0];
    const stored = createArg.data.questions;
    expect(stored[0].correct_answer).toBe("b"); // "two" is at option b
    expect(stored[1].correct_answer).toBe("c"); // "three" is at option c
  });

  it("retries generation when the correct answer text matches no option", async () => {
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(null);
    groqChatCompletion
      .mockResolvedValueOnce(
        JSON.stringify({
          questions: [
            {
              question_text: "boo",
              options: { a: "one", b: "two", c: "three", d: "four" },
              correct_answer: "not-an-option",
              difficulty: "easy",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(JSON.stringify({ questions: mockGroqQuestions }));
    mockPrisma.roadmapWeekTests.create.mockResolvedValue(mockTest);

    await roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-1");

    expect(groqChatCompletion).toHaveBeenCalledTimes(2);
    const createArg = mockPrisma.roadmapWeekTests.create.mock.calls[0][0];
    expect(createArg.data.questions[0].correct_answer).toBe("b");
  });

  it("drops incoherent questions but keeps the valid ones", async () => {
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(null);
    groqChatCompletion.mockResolvedValue(
      JSON.stringify({
        questions: [
          ...mockGroqQuestions,
          {
            question_text: "Broken one",
            options: { a: "one", b: "two", c: "three", d: "four" },
            correct_answer: "not-an-option",
            difficulty: "hard",
          },
        ],
      }),
    );
    mockPrisma.roadmapWeekTests.create.mockResolvedValue(mockTest);

    await roadmapTestService.getWeekTestFromDB("user-1", "roadmap-1", "week-1");

    const createArg = mockPrisma.roadmapWeekTests.create.mock.calls[0][0];
    expect(createArg.data.questions).toHaveLength(3);
    for (const q of createArg.data.questions) {
      expect(["a", "b", "c", "d"]).toContain(q.correct_answer);
    }
  });
});

describe("roadmapTestService.submitWeekTestToDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockRoadmap);
    mockPrisma.roadmapWeekTests.findUnique.mockResolvedValue(mockTest);
  });

  it("throws 409 when the test was already passed", async () => {
    mockPrisma.roadmapWeekTestAttempts.findFirst.mockResolvedValue({
      id: "attempt-1",
    });

    await expect(
      roadmapTestService.submitWeekTestToDB("user-1", "roadmap-1", "week-1", []),
    ).rejects.toThrow("Test already passed");
  });

  it("rejects an answer count that does not match the test size", async () => {
    await expect(
      roadmapTestService.submitWeekTestToDB("user-1", "roadmap-1", "week-1", [
        { question_id: "q-1", selected_answer: "a" },
      ]),
    ).rejects.toThrow("Answer count must match the test size (2)");
  });

  it("grades a failing attempt and does not unlock the next week", async () => {
    mockPrisma.roadmapWeekTestAttempts.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        roadmapWeekTestAttempts: { create: jest.fn().mockResolvedValue({ id: "attempt-1" }) },
        roadmapWeeks: { update: jest.fn() },
      }),
    );

    const result = await roadmapTestService.submitWeekTestToDB(
      "user-1",
      "roadmap-1",
      "week-1",
      [
        { question_id: "q-1", selected_answer: "a" },
        { question_id: "q-2", selected_answer: "c" },
      ],
    );

    expect(result.passed).toBe(false);
    expect(result.score).toBe(50);
    expect(result.correct_count).toBe(1);
    expect(result.next_unlocked_week).toBeUndefined();
  });

  it("grades a passing attempt and unlocks the next week", async () => {
    mockPrisma.roadmapWeekTestAttempts.findFirst.mockResolvedValue(null);
    const weekUpdate = jest.fn().mockResolvedValue({ id: "week-2" });
    mockPrisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        roadmapWeekTestAttempts: { create: jest.fn().mockResolvedValue({ id: "attempt-1" }) },
        roadmapWeeks: { update: weekUpdate },
      }),
    );

    const result = await roadmapTestService.submitWeekTestToDB(
      "user-1",
      "roadmap-1",
      "week-1",
      [
        { question_id: "q-1", selected_answer: "b" },
        { question_id: "q-2", selected_answer: "c" },
      ],
    );

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.next_unlocked_week).toBe(2);
    expect(weekUpdate).toHaveBeenCalledWith({
      where: { id: "week-2" },
      data: { is_unlocked: true, unlocked_at: expect.any(Date) },
    });
  });
});

describe("roadmapTestService.getFinalExamFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockRoadmap);
  });

  it("throws 403 when not all weekly tests are passed", async () => {
    mockPrisma.roadmapWeeks.findMany.mockResolvedValue([
      { id: "week-1", weekTest: { id: "test-1", attempts: [] } },
      { id: "week-2", weekTest: { id: "test-2", attempts: [{ id: "a1" }] } },
    ]);

    await expect(
      roadmapTestService.getFinalExamFromDB("user-1", "roadmap-1"),
    ).rejects.toThrow("Complete and pass every weekly test");
  });

  it("returns the exam questions without answers when all weeks passed", async () => {
    mockPrisma.roadmapWeeks.findMany.mockResolvedValue([
      { id: "week-1", weekTest: { id: "test-1", attempts: [{ id: "a1" }] } },
      { id: "week-2", weekTest: { id: "test-2", attempts: [{ id: "a2" }] } },
    ]);
    mockPrisma.roadmapFinalExams.findUnique.mockResolvedValue({
      id: "exam-1",
      roadmap_id: "roadmap-1",
      pass_score: 60,
      questions: mockQuestions,
    });

    const result = await roadmapTestService.getFinalExamFromDB(
      "user-1",
      "roadmap-1",
    );

    expect(result.exam_id).toBe("exam-1");
    expect(result.questions[0]).not.toHaveProperty("correct_answer");
  });
});

describe("roadmapTestService.submitFinalExamToDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockRoadmap);
    mockPrisma.roadmapWeeks.findMany.mockResolvedValue([
      { id: "week-1", weekTest: { id: "test-1", attempts: [{ id: "a1" }] } },
      { id: "week-2", weekTest: { id: "test-2", attempts: [{ id: "a2" }] } },
    ]);
    mockPrisma.roadmapFinalExams.findUnique.mockResolvedValue({
      id: "exam-1",
      roadmap_id: "roadmap-1",
      pass_score: 60,
      questions: mockQuestions,
    });
  });

  it("marks the roadmap completed on a passing grade", async () => {
    mockPrisma.roadmapFinalExamAttempts.findFirst.mockResolvedValue(null);
    const roadmapUpdate = jest.fn().mockResolvedValue({ id: "roadmap-1" });
    mockPrisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        roadmapFinalExamAttempts: { create: jest.fn().mockResolvedValue({ id: "attempt-1" }) },
        roadmaps: { update: roadmapUpdate },
      }),
    );

    const result = await roadmapTestService.submitFinalExamToDB(
      "user-1",
      "roadmap-1",
      [
        { question_id: "q-1", selected_answer: "b" },
        { question_id: "q-2", selected_answer: "c" },
      ],
    );

    expect(result.passed).toBe(true);
    expect(result.roadmap_completed).toBe(true);
    expect(roadmapUpdate).toHaveBeenCalledWith({
      where: { id: "roadmap-1" },
      data: { status: "completed" },
    });
  });
});
