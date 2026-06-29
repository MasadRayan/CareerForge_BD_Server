import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { roadmapService } from "./roadmap.service.js";
import type {
  CreateRoadmapPayload,
  UpdateRoadmapStatusPayload,
} from "./roadmap.interface.js";

const createRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const payload = req.body as CreateRoadmapPayload;
    const roadmap = await roadmapService.createRoadmapInDB(userId, payload);
    sendResponse(res, 201, true, "Roadmap generated successfully", roadmap);
  } catch (error) {
    next(error);
  }
};

const getAllRoadmaps = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const roadmaps = await roadmapService.getAllRoadmapsFromDB(userId);
    sendResponse(res, 200, true, "Roadmaps fetched successfully", roadmaps);
  } catch (error) {
    next(error);
  }
};

const getRoadmapById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    const roadmap = await roadmapService.getRoadmapFromDB(userId, id);
    sendResponse(res, 200, true, "Roadmap fetched successfully", roadmap);
  } catch (error) {
    next(error);
  }
};

const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id, taskId } = req.params;
    const task = await roadmapService.completeTaskInDB(userId, id, taskId);
    sendResponse(res, 200, true, "Task marked complete", task);
  } catch (error) {
    next(error);
  }
};

const updateRoadmapStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    const payload = req.body as UpdateRoadmapStatusPayload;
    const roadmap = await roadmapService.updateRoadmapStatusInDB(
      userId,
      id,
      payload,
    );
    sendResponse(res, 200, true, "Roadmap status updated", roadmap);
  } catch (error) {
    next(error);
  }
};

const deleteRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    await roadmapService.deleteRoadmapFromDB(userId, id);
    sendResponse(res, 200, true, "Roadmap deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const roadmapController = {
  createRoadmap,
  getAllRoadmaps,
  getRoadmapById,
  completeTask,
  updateRoadmapStatus,
  deleteRoadmap,
};
