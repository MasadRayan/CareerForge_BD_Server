import type { QuizQueryParams, SubmitAttemptPayload, PaginatedQuizQuestionsResponse, AttemptResult, QuizStatsResponse } from "./quiz.interface.js";
export declare const quizService: {
    getQuestionsFromDB: (params: QuizQueryParams) => Promise<PaginatedQuizQuestionsResponse>;
    submitAttemptToDB: (userId: string, payload: SubmitAttemptPayload) => Promise<AttemptResult>;
    getStatsFromDB: (userId: string) => Promise<QuizStatsResponse>;
    getAttemptHistoryFromDB: (userId: string) => Promise<{
        id: string;
        selected_answer: string;
        is_correct: boolean;
        attempted_at: Date;
        question: {
            id: string;
            difficulty: import("../../../generated/prisma/enums.js").Difficulty;
            role_category: string;
            question_text: string;
            correct_answer: string;
        };
    }[]>;
};
//# sourceMappingURL=quiz.service.d.ts.map