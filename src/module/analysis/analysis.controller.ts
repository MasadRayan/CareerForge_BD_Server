import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { analysisService } from "./analysis.service.js";
import type { CreateAnalysisPayload } from "./analysis.interface.js";

const createAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const payload = req.body as CreateAnalysisPayload;
    const analysis = await analysisService.createAnalysisInDB(userId, payload);
    sendResponse(res, 201, true, "Analysis created successfully", analysis);
  } catch (error) {
    next(error);
  }
};

const getAllAnalyses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const analyses = await analysisService.getAllAnalysesFromDB(userId);
    sendResponse(res, 200, true, "Analyses fetched successfully", analyses);
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    const analysis = await analysisService.getAnalysisFromDB(userId, id);
    sendResponse(res, 200, true, "Analysis fetched successfully", analysis);
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    await analysisService.deleteAnalysisFromDB(userId, id);
    sendResponse(res, 200, true, "Analysis deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const analysisController = {
  createAnalysis,
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
};
