import type { Response } from "express";

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message?: string,
  data?: T,
  error ?: T,
) => {
    return res.status(statusCode).json({
        success,
        ...(message !== undefined && { message }),
        ...(data !== undefined && { data }),
        ...(error !== undefined && {error})
    })
};

export default sendResponse;