import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase.js";
import sendResponse from "../utils/sendResponse.js";

export const verifyFBToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader: string | undefined = req.headers.authorization;

  // 🔒 Validate header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendResponse(res, 401, false, "Unauthorized Access");
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.decoded = decoded;
    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    sendResponse(res, 401, false, "Unauthorized Access");
    return;
  }
};