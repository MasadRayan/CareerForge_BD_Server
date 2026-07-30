import { z } from "zod";
export declare const submitAnswerSchema: z.ZodObject<{
    answer_text: z.ZodString;
}, z.core.$strip>;
export interface SubmitAnswerPayload {
    answer_text: string;
}
export interface BehavioralQuestionResponse {
    id: string;
    question_text: string;
    category: string;
}
export interface PaginatedQuestionsResponse {
    questions: BehavioralQuestionResponse[];
    pagination: {
        currentPage: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export interface BehavioralFeedback {
    structure_score: number;
    star_adherence: "excellent" | "good" | "needs_improvement";
    strengths: string[];
    suggestions: string[];
    improved_example: string;
}
export interface BehavioralAnswerResponse {
    id: string;
    question_id: string;
    question_text: string;
    category: string;
    answer_text: string;
    ai_feedback: BehavioralFeedback | null;
    answered_at: Date;
}
export interface SubmitAnswerResult {
    id: string;
    question_id: string;
    answer_text: string;
    ai_feedback: BehavioralFeedback;
    answered_at: Date;
}
//# sourceMappingURL=behavioral.interface.d.ts.map