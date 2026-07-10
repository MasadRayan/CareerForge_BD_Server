import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { quizService } from "./quiz.service.js";
import { submitAttemptSchema } from "./quiz.interface.js";
import AppError from "../../utils/AppError.js";
import type { QuizQueryParams } from "./quiz.interface.js";


const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const params: QuizQueryParams = {
      role_category: req.query.role_category as string | undefined,
      difficulty: req.query.difficulty as
        | "easy"
        | "medium"
        | "hard"
        | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const result = await quizService.getQuestionsFromDB(params);
    sendResponse(
      res,
      200,
      true,
      `Fetched ${result.questions.length} question(s) successfully`,
      result,
    );
  } catch (error) {
    next(error);
  }
};

const submitAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = submitAttemptSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(messages, 422);
    }

    const userId = req.user!.id;
    const result = await quizService.submitAttemptToDB(userId, parsed.data);

    sendResponse(
      res,
      200,
      true,
      result.is_correct
        ? "Correct! Well done."
        : `Incorrect. The correct answer was "${result.correct_answer}".`,
      result,
    );
  } catch (error) {
    next(error);
  }
};

const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await quizService.getStatsFromDB(userId);
    sendResponse(res, 200, true, "Quiz stats fetched successfully", stats);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const history = await quizService.getAttemptHistoryFromDB(userId);
    sendResponse(
      res,
      200,
      true,
      "Attempt history fetched successfully",
      history,
    );
  } catch (error) {
    next(error);
  }
};

export const quizController = {
  getQuestions,
  submitAttempt,
  getStats,
  getHistory,
};
