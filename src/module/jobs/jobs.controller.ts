import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import env from "../../config/env.js";
import { jobsService } from "./jobs.service.js";

const searchJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.query.q as string) ?? "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await jobsService.searchJobs(query, page, limit);
    sendResponse(res, 200, true, "Jobs fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

const refreshW3Schools = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const expected = env.CRON_SECRET;
    const header = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "").trim();

    if (!expected || header !== expected) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await jobsService.refreshW3SchoolsCatalog();
    sendResponse(res, 200, true, `W3Schools catalog refreshed (${count} links)`, { count });
  } catch (error) {
    next(error);
  }
};

const crawl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const expected = env.CRON_SECRET;
    const header = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "").trim();

    if (!expected || header !== expected) {
      throw new AppError("Unauthorized", 401);
    }

    const { searchTerm, maxPages } = req.body ?? {};
    if (!searchTerm || typeof searchTerm !== "string") {
      throw new AppError("searchTerm is required", 400);
    }

    const result = await jobsService.crawlBdjobs(searchTerm, Number(maxPages) || 3);
    sendResponse(res, 200, true, `Crawl complete: ${result.saved} jobs saved`, result);
  } catch (error) {
    next(error);
  }
};

export const jobsController = {
  searchJobs,
  refreshW3Schools,
  crawl,
};