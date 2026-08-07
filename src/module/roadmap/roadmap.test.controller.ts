import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import { roadmapTestService } from "./roadmap.test.service.js";
import { submitWeekTestSchema, submitFinalExamSchema } from "./roadmap.test.interface.js";

const getWeekTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { roadmapId, weekId } = req.params;
    const result = await roadmapTestService.getWeekTestFromDB(
      userId,
      roadmapId,
      weekId,
    );
    sendResponse(
      res,
      200,
      true,
      `Week ${result.week_number} test fetched successfully`,
      result,
    );
  } catch (error) {
    next(error);
  }
};

const submitWeekTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = submitWeekTestSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(messages, 422);
    }

    const userId = req.user!.id;
    const { roadmapId, weekId } = req.params;
    const result = await roadmapTestService.submitWeekTestToDB(
      userId,
      roadmapId,
      weekId,
      parsed.data.answers,
    );

    sendResponse(
      res,
      200,
      true,
      result.passed
        ? `Test passed with ${result.score}%.${result.next_unlocked_week ? ` Week ${result.next_unlocked_week} unlocked.` : " Final exam now available."}`
        : `Test failed with ${result.score}%. Passing score is 60%.`,
      result,
    );
  } catch (error) {
    next(error);
  }
};

const getFinalExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { roadmapId } = req.params;
    const result = await roadmapTestService.getFinalExamFromDB(
      userId,
      roadmapId,
    );
    sendResponse(res, 200, true, "Final exam fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

const submitFinalExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = submitFinalExamSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(messages, 422);
    }

    const userId = req.user!.id;
    const { roadmapId } = req.params;
    const result = await roadmapTestService.submitFinalExamToDB(
      userId,
      roadmapId,
      parsed.data.answers,
    );

    sendResponse(
      res,
      200,
      true,
      result.passed
        ? "Congratulations! You passed the final exam. Roadmap completed."
        : `Final exam failed with ${result.score}%. Passing score is 60%.`,
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const roadmapTestController = {
  getWeekTest,
  submitWeekTest,
  getFinalExam,
  submitFinalExam,
};
