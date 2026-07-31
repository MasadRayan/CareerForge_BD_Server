import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase.js";
import { prisma } from "../lib/prisma.js";
import sendResponse from "../utils/sendResponse.js";

const extractToken = (authHeader: string): string | null => {
  let value = authHeader.trim();

  if (!/^Bearer\s+/i.test(value)) {
    return null;
  }

  // strip "Bearer " (tolerates a duplicated "Bearer Bearer ..." prefix)
  value = value.replace(/^Bearer\s+/i, "");
  if (/^Bearer\s+/i.test(value)) {
    value = value.replace(/^Bearer\s+/i, "");
  }
  value = value.trim();

  // strip wrapping quotes copied from API clients
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!value) {
    return null;
  }

  // fail fast if it isn't JWT-shaped: header.payload.signature
  const parts = value.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return null;
  }

  return value;
};

export const verifyFBToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader: string | undefined = req.headers.authorization;
  const token = authHeader ? extractToken(authHeader) : null;

  if (!token) {
    sendResponse(res, 401, false, "Unauthorized Access");
    return;
  }

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