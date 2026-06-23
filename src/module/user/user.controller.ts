import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";
import { number } from "zod";

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
    //have to add pagination
    const page = Number(req.query.page) || 1;
    const users = await userService.getAllUserFromDB(page as number);
    sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error: any) {
    next(error);
  }
};

const getASingleUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.params.email;
        const user = await userService.getASingleUser(email);
        sendResponse(res, 200, true, "User fetched successfully", user);
    } catch (error: any) {
        next(error)
    }
};

export const userController = {
  createUser,
  getAllUsers,
  getASingleUser
};
