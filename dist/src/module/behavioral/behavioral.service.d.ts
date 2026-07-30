import type { SubmitAnswerPayload, BehavioralFeedback, SubmitAnswerResult } from "./behavioral.interface.js";
export declare const behavioralService: {
    getQuestionsFromDB: (params: {
        category?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        questions: {
            id: string;
            question_text: string;
            category: string;
        }[];
        pagination: {
            currentPage: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    getQuestionFromDB: (id: string) => Promise<{
        id: string;
        question_text: string;
        category: string;
    }>;
    submitAnswerToDB: (userId: string, questionId: string, payload: SubmitAnswerPayload) => Promise<SubmitAnswerResult>;
    getAnswersFromDB: (userId: string) => Promise<{
        id: string;
        question_id: string;
        question_text: string;
        category: string;
        answer_text: string;
        ai_feedback: BehavioralFeedback | null;
        answered_at: Date;
    }[]>;
};
//# sourceMappingURL=behavioral.service.d.ts.map