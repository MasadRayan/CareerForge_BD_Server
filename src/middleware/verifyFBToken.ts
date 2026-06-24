import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase.js";
import { prisma } from "../lib/prisma.js";
import sendResponse from "../utils/sendResponse.js";

export const verifyFBToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendResponse(res, 401, false, "Unauthorized Access");
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.decoded = decoded;

    const user = await prisma.users.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      sendResponse(res, 401, false, "User not found");
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    sendResponse(res, 401, false, "Unauthorized Access");
    return;
  }
};