export const roadmapBatchPrompt = (gapSkills, startWeek, endWeek, totalWeeks) => {
    const skills = gapSkills.slice(0, 10);
    return `
You are a senior engineering career coach.

Generate weeks ${startWeek} to ${endWeek} of a ${totalWeeks}-week learning roadmap.
Weeks 1-${Math.ceil(totalWeeks / 3)} are foundational, weeks ${Math.ceil(totalWeeks / 3) + 1}-${Math.ceil((2 * totalWeeks) / 3)} are intermediate, and the rest are advanced.

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "weeks": [
    {
      "week_number": <int>,
      "topic_summary": <one-line summary>,
      "resources": [
        { "title": <string>, "url": <string>, "type": "video"|"article"|"docs"|"course" }
      ],
      "daily_tasks": [<string>, <string>, <string>, <string>, <string>]
    }
  ]
}

RULES:
- Output EXACTLY ${endWeek - startWeek + 1} week(s) (week_number from ${startWeek} to ${endWeek}).
- Each week: exactly 2 resources, exactly 5 daily_tasks.
- Resources must use real, publicly accessible URLs.

SKILL GAPS: ${JSON.stringify(skills)}

Return ONLY valid JSON. No explanation, no markdown fences.
`.trim();
};
export const roadmapPrompt = (gapSkills, durationWeeks) => {
    const skills = gapSkills.slice(0, 8);
    return `
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
          "url": <string>,
          "type": "video" | "article" | "docs" | "course"
        }
      ],
      "daily_tasks": [<string>, <string>, <string>, <string>, <string>]
    }
  ]
}

GUIDELINES:
- Generate EXACTLY ${durationWeeks} weeks.
- Each week: exactly 2 resources, exactly 5 daily_tasks.
- Order weeks from foundational concepts to advanced application.
- URLs must be real and publicly accessible.

SKILL GAPS TO ADDRESS: ${JSON.stringify(skills)}

Return ONLY valid JSON matching the schema above. No explanation text,
no markdown fences, no trailing commentary.
`.trim();
};
//# sourceMappingURL=roadmap.prompt.js.map