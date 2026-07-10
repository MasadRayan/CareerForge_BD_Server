import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { quizService } from "./quiz.service.js";
import { submitAttemptSchema } from "./quiz.interface.js";
import AppError from "../../utils/AppError.js";
import type { QuizQueryParams } from "./quiz.interface.js";

/**
 * GET /api/quiz
 * Query params: role_category, difficulty, limit (default 10, max 50)
 *
 * Returns a list of quiz questions WITHOUT the correct_answer.
 */
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
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const questions = await quizService.getQuestionsFromDB(params);
    sendResponse(
      res,
      200,
      true,
      `Fetched ${questions.length} question(s) successfully`,
      questions,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quiz/attempt
 * Body: { question_id: uuid, selected_answer: "a"|"b"|"c"|"d" }
 *
 * Records the attempt and returns the result including the correct answer.
 */
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

/**
 * GET /api/quiz/stats
 * Returns the authenticated user's overall quiz statistics.
 */
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

/**
 * GET /api/quiz/history
 * Returns the authenticated user's full attempt history, newest first.
 */
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
