import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import { sendStudyReminder, sendSubscriptionExpiry } from "./email.service.js";

const triggerReminder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user_id } = req.body;
    if (!user_id) throw new AppError("user_id is required", 400);

    await sendStudyReminder(user_id);
    sendResponse(res, 200, true, "Study reminder sent successfully");
  } catch (error) {
    next(error);
  }
};

const triggerExpiry = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user_id, days_left } = req.body;
    if (!user_id) throw new AppError("user_id is required", 400);

    await sendSubscriptionExpiry(user_id, days_left ?? 7);
    sendResponse(res, 200, true, "Subscription expiry email sent successfully");
  } catch (error) {
    next(error);
  }
};

export const notificationController = {
  triggerReminder,
  triggerExpiry,
};
