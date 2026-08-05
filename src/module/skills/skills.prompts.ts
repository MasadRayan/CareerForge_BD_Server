export const extractSkillsPrompt = (cvText: string): string => `
You are an expert resume parser who extracts a clean, canonical list of
professional skills from a CV.

TASK
----
Given the CV text below, extract every distinct hard skill and technology
mentioned. Include programming languages, frameworks, libraries, databases,
tools, cloud platforms, and relevant soft skills only if they are explicitly
stated in the CV.

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "skills": ["<string>", ...]
}

GUIDELINES
-----------
- Use canonical, widely-recognized names (e.g. "JavaScript", "TypeScript",
  "React", "Node.js", "PostgreSQL", "Docker", "AWS", "Git").
- Normalize capitalization to how the industry writes the skill.
- Do NOT invent skills that are not supported by the CV text.
- Deduplicate; aim for 8-25 entries.
- Exclude generic filler like "teamwork" or "communication" unless the CV
  lists them explicitly as skills.

CV TEXT
-------
${cvText}

Return ONLY valid JSON matching the schema above. No explanation text,
no markdown fences, no trailing commentary.
`.trim();
