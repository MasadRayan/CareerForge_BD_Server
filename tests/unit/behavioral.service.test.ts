import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));

import { behavioralService } from "../../src/module/behavioral/behavioral.service";

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

const mockGroqFeedback = JSON.stringify({
  structure_score: 8,
  star_adherence: "good",
  strengths: ["clear"],
  suggestions: ["be specific"],
  improved_example: "Example answer",
});

const mockQuestions = [
  {
    id: "bq-1",
    question_text: "Tell me about a time you led a team",
    category: "leadership",
  },
  {
    id: "bq-2",
    question_text: "Describe a conflict you resolved",
    category: "teamwork",
  },
  {
    id: "bq-3",
    question_text: "How do you handle tight deadlines?",
    category: "time_management",
  },
];

const mockQuestion = mockQuestions[0];

const mockAnswer = {
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
  answered_at: new Date(),
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
  answered_at: new Date(),
  question: {
    question_text: "Tell me about a time you led a team",
    category: "leadership",
  },
};

describe("behavioralService.getQuestionsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns paginated questions with defaults", async () => {
    mockPrisma.behavioralQuestions.findMany.mockResolvedValue(mockQuestions);
    mockPrisma.behavioralQuestions.count.mockResolvedValue(mockQuestions.length);

    const result = await behavioralService.getQuestionsFromDB({});

    expect(result.questions).toHaveLength(3);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalItems).toBe(3);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it("filters by category", async () => {
    const filtered = [mockQuestions[0]];
    mockPrisma.behavioralQuestions.findMany.mockResolvedValue(filtered);
    mockPrisma.behavioralQuestions.count.mockResolvedValue(filtered.length);

    const result = await behavioralService.getQuestionsFromDB({ category: "leadership" });

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].category).toBe("leadership");
    expect(mockPrisma.behavioralQuestions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: "leadership" },
      }),
    );
    expect(mockPrisma.behavioralQuestions.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: "leadership" },
      }),
    );
  });

  it("handles custom page and limit", async () => {
    mockPrisma.behavioralQuestions.findMany.mockResolvedValue([mockQuestions[0]]);
    mockPrisma.behavioralQuestions.count.mockResolvedValue(10);

    const result = await behavioralService.getQuestionsFromDB({ page: 2, limit: 1 });

    expect(result.questions).toHaveLength(1);
    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.limit).toBe(1);
    expect(result.pagination.totalPages).toBe(10);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(true);
    expect(mockPrisma.behavioralQuestions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 1, take: 1 }),
    );
  });
});

describe("behavioralService.getQuestionFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a question when found", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(mockQuestion);

    const result = await behavioralService.getQuestionFromDB("bq-1");

    expect(result.id).toBe("bq-1");
    expect(result.question_text).toBe("Tell me about a time you led a team");
  });

  it("throws 404 when question not found", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(null);

    await expect(
      behavioralService.getQuestionFromDB("nonexistent"),
    ).rejects.toThrow("Question not found");
  });
});

describe("behavioralService.submitAnswerToDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("throws 404 when question does not exist", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(null);

    await expect(
      behavioralService.submitAnswerToDB("user-1", "nonexistent", {
        answer_text: "My answer",
      }),
    ).rejects.toThrow("Question not found");
  });

  it("submits answer and returns with groq feedback", async () => {
    mockPrisma.behavioralQuestions.findUnique.mockResolvedValue(mockQuestion);
    groqChatCompletion.mockResolvedValue(mockGroqFeedback);
    mockPrisma.behavioralAnswers.create.mockResolvedValue(mockAnswer);

    const result = await behavioralService.submitAnswerToDB("user-1", "bq-1", {
      answer_text: "I led a team of 5 engineers...",
    });

    expect(result.id).toBe("ans-1");
    expect(result.question_id).toBe("bq-1");
    expect(result.answer_text).toBe("I led a team of 5 engineers...");
    expect(result.ai_feedback.structure_score).toBe(8);
    expect(result.ai_feedback.star_adherence).toBe("good");
    expect(groqChatCompletion).toHaveBeenCalled();
  });
});

describe("behavioralService.getAnswersFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns mapped answers with question text and category", async () => {
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([mockAnswerWithQuestion]);

    const result = await behavioralService.getAnswersFromDB("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].question_text).toBe("Tell me about a time you led a team");
    expect(result[0].category).toBe("leadership");
    expect(result[0].answer_text).toBe("I led a team of 5 engineers...");
  });

  it("returns empty array when no answers exist", async () => {
    mockPrisma.behavioralAnswers.findMany.mockResolvedValue([]);

    const result = await behavioralService.getAnswersFromDB("user-1");

    expect(result).toEqual([]);
  });
});
