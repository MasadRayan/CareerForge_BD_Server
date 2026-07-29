export interface SubScores {
  quiz_accuracy: number | null;
  behavioral_score: number | null;
}

export interface ReadinessScoreResponse {
  id: string;
  ats_component: number;
  roadmap_component: number;
  interview_component: number;
  sub_scores: SubScores;
  composite_score: number;
  calculated_at: Date;
}

export interface ReadinessHistoryItem {
  id: string;
  composite_score: number;
  ats_component: number;
  roadmap_component: number;
  interview_component: number;
  calculated_at: Date;
}
