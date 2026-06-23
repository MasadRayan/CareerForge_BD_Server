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

export const userController = {
  createUser,
};
