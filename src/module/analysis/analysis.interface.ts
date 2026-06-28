export interface CreateAnalysisPayload {
  cv_id: string;
  jd_id: string;
}

export interface GeminiAtsResponse {
  ats_score: number;
  keyword_match_breakdown: {
    matched_keywords: string[];
    missing_keywords: string[];
    formatting_issues: string[];
    missing_sections: string[];
  };
  gap_skills: string[];
  rewrite_suggestions: {
    original: string;
    suggested: string;
    explanation: string;
  }[];
}

export interface AnalysisListItem {
  id: string;
  cv_id: string;
  jd_id: string;
  ats_score: number;
  created_at: Date;
}

export interface AnalysisResponse extends AnalysisListItem {
  keyword_match_breakdown: GeminiAtsResponse["keyword_match_breakdown"];
  gap_skills: GeminiAtsResponse["gap_skills"];
  rewrite_suggestions: GeminiAtsResponse["rewrite_suggestions"];
}
