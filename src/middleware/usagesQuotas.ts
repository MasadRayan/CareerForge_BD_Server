import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import sendResponse from "../utils/sendResponse.js";

const FREE_TIER_MONTHLY_LIMIT = 1;

export const usageQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user!;

  if (user.role !== "free_user") {
    return next();
  }

  try {
    const now = new Date();

    let quota = await prisma.usageQuotas.findUnique({
      where: { user_id: user.id },
    });

    if (!quota) {
      quota = await prisma.usageQuotas.create({
        data: {
          user_id: user.id,
          analyses_used_this_month: 0,
          reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1), // 1st of next month
        },
      });
    }

    // ─── Reset quota if the reset date has passed ─────────
    if (now >= quota.reset_date) {
      quota = await prisma.usageQuotas.update({
        where: { user_id: user.id },
        data: {
          analyses_used_this_month: 0,
          reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      });
    }

    // ─── Check if limit is reached ────────────────────────
    if (quota.analyses_used_this_month >= FREE_TIER_MONTHLY_LIMIT) {
      sendResponse(
        res,
        429,
        false,
        `Free tier limit reached. You can only run ${FREE_TIER_MONTHLY_LIMIT} analysis per month. Upgrade to premium for unlimited access.`
      );
      return;
    }

    // ─── Increment usage count ────────────────────────────
    await prisma.usageQuotas.update({
      where: { user_id: user.id },
      data: {
        analyses_used_this_month: { increment: 1 },
      },
    });

    return next();
  } catch (error) {
    next(error);
  }
};