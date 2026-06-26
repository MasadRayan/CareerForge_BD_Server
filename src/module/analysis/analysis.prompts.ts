export const atsAnalysisPrompt = (cvText: string, jdText: string): string => `
You are an expert ATS (Applicant Tracking System) analyzer with deep
experience evaluating resumes against job descriptions.

TASK
----
Given the CV and the Job Description below, score how well the CV would
pass an automated ATS screen and produce actionable rewrite suggestions.

OUTPUT SCHEMA (strict JSON — no commentary, no markdown fences):
{
  "ats_score": <integer between 0 and 100>,
  "keyword_match_breakdown": {
    "matched_keywords": [<string>, ...],
    "missing_keywords": [<string>, ...],
    "formatting_issues": [<string>, ...],
    "missing_sections": [<string>, ...]
  },
  "gap_skills": [<string>, ...],
  "rewrite_suggestions": [
    {
      "original": <exact phrase or bullet from the CV>,
      "suggested": <improved version>,
      "explanation": <one-sentence rationale>
    }
  ]
}

GUIDELINES
-----------
- ats_score: holistic 0-100 rating of CV ↔ JD fit.
- matched_keywords / missing_keywords: hard-skill and tool keywords
  (e.g. "TypeScript", "PostgreSQL", "CI/CD"). Aim for 8-20 entries each.
- formatting_issues: layout problems that hurt ATS parsing (tables,
  columns, images, headers/footers with contact info, etc.).
- missing_sections: standard CV sections absent (Summary, Skills,
  Experience, Education, Projects, Certifications).
- gap_skills: skills implied by the JD that the CV does NOT evidence.
  Used downstream for roadmap generation.
- rewrite_suggestions: 3-5 concrete rewrites. The "original" field must be a
  verbatim phrase from the CV. Keep suggestions one bullet long.

CV TEXT
-------
${cvText}

JOB DESCRIPTION
---------------
${jdText}

Return ONLY valid JSON matching the schema above. No explanation text,
no markdown fences, no trailing commentary.
`.trim();

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
