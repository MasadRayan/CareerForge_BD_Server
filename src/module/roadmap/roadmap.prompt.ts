export const roadmapPrompt = (
  gapSkills: string[],
  durationWeeks: number,
): string => `
You are a senior engineering career coach.

Given a list of skill gaps and a ${durationWeeks}-week preparation
window, generate a structured learning roadmap.

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "weeks": [
    {
      "week_number": <int starting at 1>,
      "topic_summary": <one-line summary of the week's focus>,
      "resources": [
        {
          "title": <string>,
          "url": <string>, // must be a real, public URL
          "type": "video" | "article" | "docs" | "course"
        }
      ],
      "daily_tasks": [<string>, <string>, ...] // 5-7 tasks per week
    }
  ]
}

GUIDELINES
-----------
- Generate EXACTLY ${durationWeeks} weeks.
- Each week must have 2-4 resources of varied types.
- daily_tasks must have 5-7 entries; keep them specific and actionable.
- Order weeks from foundational concepts to advanced application.
- URLs must be real and publicly accessible (official docs, well-known
  MOOCs, reputable YouTube channels). Do not invent URLs.

SKILL GAPS TO ADDRESS
---------------------
${JSON.stringify(gapSkills)}

DURATION
--------
${durationWeeks} weeks

Return ONLY valid JSON matching the schema above. No explanation text,
no markdown fences, no trailing commentary.
`.trim();
