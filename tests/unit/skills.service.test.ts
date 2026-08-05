import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));

import { skillsService } from "../../src/module/skills/skills.service";

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

const mockGroqResponse = JSON.stringify({
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
});

const mockCV = { id: "cv-1", user_id: "user-1", raw_text: "CV text" };

describe("skillsService.extractSkillsFromCV", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPrisma.systemLogs.create.mockResolvedValue({});
  });

  it("throws 404 when CV is missing or not owned by the user", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);

    await expect(
      skillsService.extractSkillsFromCV("user-1", "cv-1"),
    ).rejects.toThrow("CV not found");
  });

  it("throws 502 when the Groq request fails", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    groqChatCompletion.mockRejectedValue(new Error("rate limited"));

    await expect(
      skillsService.extractSkillsFromCV("user-1", "cv-1"),
    ).rejects.toThrow("AI service is unavailable. Please try again in a moment.");
    expect(mockPrisma.systemLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "ai_failure" }),
      }),
    );
  });

  it("throws 502 when the AI returns malformed JSON", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    groqChatCompletion.mockResolvedValue("not json at all");

    await expect(
      skillsService.extractSkillsFromCV("user-1", "cv-1"),
    ).rejects.toThrow("AI returned a non-JSON response");
  });

  it("throws 502 when the JSON shape is invalid", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    groqChatCompletion.mockResolvedValue(JSON.stringify({ foo: "bar" }));

    await expect(
      skillsService.extractSkillsFromCV("user-1", "cv-1"),
    ).rejects.toThrow("AI returned an unexpected response shape. Please try again.");
  });

  it("returns normalized skills on success", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    groqChatCompletion.mockResolvedValue(
      JSON.stringify({
        skills: ["React", " React ", "", "react", "TypeScript", "Node.js"],
      }),
    );

    const result = await skillsService.extractSkillsFromCV("user-1", "cv-1");

    expect(result).toEqual({ skills: ["React", "TypeScript", "Node.js"] });
  });

  it("handles fenced JSON from the AI", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    groqChatCompletion.mockResolvedValue(
      '```json\n{"skills": ["Git", "AWS"]}\n```',
    );

    const result = await skillsService.extractSkillsFromCV("user-1", "cv-1");

    expect(result).toEqual({ skills: ["Git", "AWS"] });
  });
});
