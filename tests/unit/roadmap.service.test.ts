import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
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

import { roadmapService } from "../../src/module/roadmap/roadmap.service";

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");
const { verifyResources } = jest.requireMock("../../src/lib/urlValidator");

const validGroqResponse = JSON.stringify({
  weeks: [
    {
      week_number: 1,
      topic_summary: "Introduction to Skill Building",
      resources: [
        { title: "Getting Started Guide", url: "https://example.com/start", type: "article" },
        { title: "Practice Basics", url: "https://example.com/practice", type: "video" },
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

const mockAnalysis = {
  id: "analysis-1",
  gap_skills: ["python", "docker"],
  jd: { interview_date: null },
};

const mockCreatedRoadmap = {
  id: "roadmap-1",
  analysis_id: "analysis-1",
  user_id: "user-1",
  duration_weeks: 4,
  status: "active" as const,
  created_at: new Date("2025-06-01"),
  weeks: [
    {
      id: "week-1",
      roadmap_id: "roadmap-1",
      week_number: 1,
      topic_summary: "Introduction to Skill Building",
      start_date: new Date(),
      end_date: new Date(),
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

const mockRoadmapListItem = {
  id: "roadmap-1",
  analysis_id: "analysis-1",
  duration_weeks: 4,
  status: "active" as const,
  created_at: new Date("2025-06-01"),
};

describe("roadmapService.createRoadmapInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("throws 400 when analysis_id is missing", async () => {
    await expect(
      roadmapService.createRoadmapInDB("user-1", { analysis_id: "" }),
    ).rejects.toThrow("analysis_id is required");

    await expect(
      roadmapService.createRoadmapInDB("user-1", { analysis_id: undefined as any }),
    ).rejects.toThrow("analysis_id is required");
  });

  it("throws 404 when analysis is not found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.createRoadmapInDB("user-1", { analysis_id: "analysis-missing" }),
    ).rejects.toThrow("Analysis not found or not owned by you");
  });

  it("creates a roadmap with 4 weeks (single batch)", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(mockAnalysis);
    groqChatCompletion.mockResolvedValue(validGroqResponse);
    verifyResources.mockResolvedValue({ valid: [{ title: "Getting Started Guide", url: "https://example.com/start", type: "article" }], invalid: [] });
    mockPrisma.roadmaps.create.mockResolvedValue(mockCreatedRoadmap);

    const result = await roadmapService.createRoadmapInDB("user-1", {
      analysis_id: "analysis-1",
    });

    expect(result.id).toBe("roadmap-1");
    expect(result.duration_weeks).toBe(4);
    expect(result.weeks).toHaveLength(1);
    expect(mockPrisma.analyses.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "analysis-1", cv: { user_id: "user-1" } },
      }),
    );
    expect(groqChatCompletion).toHaveBeenCalled();
    expect(mockPrisma.roadmaps.create).toHaveBeenCalled();
  });
});

describe("roadmapService.getAllRoadmapsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a list of roadmaps", async () => {
    mockPrisma.roadmaps.findMany.mockResolvedValue([mockRoadmapListItem]);

    const result = await roadmapService.getAllRoadmapsFromDB("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("roadmap-1");
    expect(mockPrisma.roadmaps.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1" },
        orderBy: { created_at: "desc" },
      }),
    );
  });
});

describe("roadmapService.getRoadmapFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a roadmap with weeks included", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(mockCreatedRoadmap);

    const result = await roadmapService.getRoadmapFromDB("user-1", "roadmap-1");

    expect(result.id).toBe("roadmap-1");
    expect(result.weeks).toHaveLength(1);
    expect(result.weeks[0].resources).toHaveLength(2);
    expect(result.weeks[0].dailyTasks).toHaveLength(5);
  });

  it("throws 404 when roadmap is not found", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.getRoadmapFromDB("user-1", "nonexistent"),
    ).rejects.toThrow("Roadmap not found");
  });
});

describe("roadmapService.completeTaskInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("completes a task and updates streak", async () => {
    const mockTask = {
      id: "task-1",
      week_id: "week-1",
      description: "Read the guide",
      is_completed: false,
      completed_at: null,
    };
    const mockCompletedTask = { ...mockTask, is_completed: true, completed_at: new Date() };

    mockPrisma.dailyTasks.findFirst.mockResolvedValue(mockTask);
    mockPrisma.dailyTasks.update.mockResolvedValue(mockCompletedTask);
    mockPrisma.streaks.findUnique.mockResolvedValue(null);
    mockPrisma.streaks.upsert.mockResolvedValue({
      user_id: "user-1",
      current_streak: 1,
      longest_streak: 1,
      last_active_date: new Date(),
    });

    const result = await roadmapService.completeTaskInDB("user-1", "roadmap-1", "task-1");

    expect(result.is_completed).toBe(true);
    expect(mockPrisma.dailyTasks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({ is_completed: true }),
      }),
    );
    expect(mockPrisma.streaks.upsert).toHaveBeenCalled();
  });

  it("throws 404 when task is not found", async () => {
    mockPrisma.dailyTasks.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.completeTaskInDB("user-1", "roadmap-1", "nonexistent"),
    ).rejects.toThrow("Task not found or not owned by you");
  });

  it("throws 409 when task is already completed", async () => {
    mockPrisma.dailyTasks.findFirst.mockResolvedValue({
      id: "task-1",
      is_completed: true,
    });

    await expect(
      roadmapService.completeTaskInDB("user-1", "roadmap-1", "task-1"),
    ).rejects.toThrow("Task is already completed");
  });
});

describe("roadmapService.updateRoadmapStatusInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("updates roadmap status successfully", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockPrisma.roadmaps.update.mockResolvedValue({
      id: "roadmap-1",
      status: "completed" as const,
    });

    const result = await roadmapService.updateRoadmapStatusInDB("user-1", "roadmap-1", {
      status: "completed",
    });

    expect(result.status).toBe("completed");
    expect(mockPrisma.roadmaps.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "roadmap-1" },
        data: { status: "completed" },
      }),
    );
  });

  it("throws 404 when roadmap is not found", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.updateRoadmapStatusInDB("user-1", "nonexistent", {
        status: "abandoned",
      }),
    ).rejects.toThrow("Roadmap not found");
  });
});

describe("roadmapService.deleteRoadmapFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("deletes a roadmap successfully", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockPrisma.roadmaps.delete.mockResolvedValue({ id: "roadmap-1" });

    await roadmapService.deleteRoadmapFromDB("user-1", "roadmap-1");

    expect(mockPrisma.roadmaps.delete).toHaveBeenCalledWith({
      where: { id: "roadmap-1" },
    });
  });

  it("throws 404 when roadmap is not found", async () => {
    mockPrisma.roadmaps.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.deleteRoadmapFromDB("user-1", "nonexistent"),
    ).rejects.toThrow("Roadmap not found");
  });
});
