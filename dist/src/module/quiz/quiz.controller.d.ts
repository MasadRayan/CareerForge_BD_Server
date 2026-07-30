import { NextFunction, Request, Response } from "express";
export declare const quizController: {
    getQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    submitAttempt: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=quiz.controller.d.ts.map