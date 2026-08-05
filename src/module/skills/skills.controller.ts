import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { skillsService } from "./skills.service.js";

const extractSkills = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const cvId = req.params.id;
    const result = await skillsService.extractSkillsFromCV(userId, cvId);
    sendResponse(res, 200, true, "Skills extracted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const skillsController = {
  extractSkills,
};
