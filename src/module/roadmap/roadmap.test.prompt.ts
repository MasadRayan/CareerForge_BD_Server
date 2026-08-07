
/**
 * Prompts for AI-generated roadmap tests (weekly + final exam).
 * Each returns strict JSON validated against a Zod schema in
 * roadmap.test.interface.ts.
 */

type TestResource = { title: string };

export const weekTestPrompt = (
  weekNumber: number,
  topicSummary: string,
  resources: TestResource[],
  skillGaps: string[],
): string => {
  const resourceTitles = resources.map((r) => r.title).join("; ") || "none";

  return `
You are a senior technical interviewer creating a short knowledge check.

A candidate is in week ${weekNumber} of a learning roadmap. Based ONLY on the
week's topic, generate EXACTLY 5 multiple-choice questions that verify they
understood the material.

WEEK TOPIC: ${topicSummary}
WEEK RESOURCES: ${resourceTitles}
RELEVANT SKILL GAPS: ${JSON.stringify(skillGaps.slice(0, 5))}

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "questions": [
    {
      "question_text": <string>,
      "options": { "a": <string>, "b": <string>, "c": <string>, "d": <string> },
      "correct_answer": "a" | "b" | "c" | "d",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

RULES:
- Output EXACTLY 5 questions, roughly 1 easy, 2 medium, 2 hard.
- Questions must be answerable from the week's topic and resources alone.
- Options must be plausible; exactly one is correct.
- correct_answer must be one of "a", "b", "c", "d".
- Do not repeat questions.

Return ONLY valid JSON. No explanation, no markdown fences.
`.trim();
};

export const finalExamPrompt = (
  weeks: { week_number: number; topic_summary: string }[],
  skillGaps: string[],
): string => {
  const topics = weeks
    .map((w) => `Week ${w.week_number}: ${w.topic_summary}`)
    .join("\n");

  return `
You are a senior technical interviewer conducting the FINAL exam for a
complete learning roadmap. The candidate has finished all ${weeks.length}
weeks and must demonstrate overall mastery.

Generate EXACTLY 30 multiple-choice questions spanning the whole roadmap.
Cover all weeks roughly evenly.

ROADMAP TOPICS:
${topics}

OVERALL SKILL GAPS: ${JSON.stringify(skillGaps.slice(0, 10))}

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "questions": [
    {
      "question_text": <string>,
      "options": { "a": <string>, "b": <string>, "c": <string>, "d": <string> },
      "correct_answer": "a" | "b" | "c" | "d",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

RULES:
- Output EXACTLY 30 questions. Include a healthy mix of difficulties.
- Questions must be answerable from the roadmap topics above.
- Options must be plausible; exactly one is correct.
- correct_answer must be one of "a", "b", "c", "d".
- Do not repeat questions.

Return ONLY valid JSON. No explanation, no markdown fences.
`.trim();
};
