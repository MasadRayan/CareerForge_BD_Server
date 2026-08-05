import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";
import AppError from "../../utils/AppError";

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

const getASingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.params.email;
    const user = await userService.getASingleUser(email);
    sendResponse(res, 200, true, "User fetched successfully", user);
  } catch (error: any) {
    next(error);
  }
};

const skillsSchema = z.array(z.string());

const updateASingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.params.email;
    const payload = req.body;

    if (payload.skills !== undefined) {
      const parsed = skillsSchema.safeParse(payload.skills);
      if (!parsed.success) {
        throw new AppError("skills must be an array of strings", 400);
      }
    }

    const updatedUser = await userService.updateASingleUserInDB(email, payload);
    sendResponse(res, 200, true, "User updated successfully", updatedUser);

  } catch (error : any) {
    next(error)
  }
};

const deleteASingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.params.email;
    const deleteUser  = await userService.deleteAUserFromDB(email);
    sendResponse(res, 200, true, "User deleted successfully");
  } catch (error : any) {
    next(error)
  }
};

const getRoleOfUser = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.user!.id
  try {
    const userRole = await userService.getRoleOfUserFromDB(id);
    sendResponse(res, 200, true, "User role fetched successfully", userRole);
  } catch (error) {
    next(error)
  }
}

const roleSchema = z.enum(["free_user", "premium_user", "admin"]);

const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.params.email;
    const parsed = roleSchema.safeParse(req.body?.role);

    if (!parsed.success) {
      throw new AppError("Invalid role. Must be free_user, premium_user or admin", 400);
    }

    if (req.user!.email === email) {
      throw new AppError("You cannot change your own role", 400);
    }

    const updatedUser = await userService.updateUserRoleFromDB(email, parsed.data);
    sendResponse(res, 200, true, "User role updated successfully", updatedUser);
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createUser,
  getAllUsers,
  getASingleUser,
  updateASingleUser,
  deleteASingleUser,
  getRoleOfUser,
  updateUserRole
};
