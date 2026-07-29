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
