import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);
    sendResponse(res, 201, true, "User created successfully", user);
  } catch (error: any) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUserFromDB();
    sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error: any) {
    next(error);
  }
};

export const userController = {
  createUser,
  getAllUsers
};
