import { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import { certificateService } from "./certificate.service.js";
import {
  startTestSchema,
  submitTestSchema,
} from "./certificate.interface.js";

const startTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = startTestSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(messages, 422);
    }

    const data = await certificateService.startTestInDB(
      req.user!.id,
      parsed.data.skill,
    );
    sendResponse(res, 201, true, "Skill test generated successfully", data);
  } catch (error) {
    next(error);
  }
};

const submitTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = submitTestSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new AppError(messages, 422);
    }

    const { attemptId } = req.params;
    const data = await certificateService.submitTestInDB(
      req.user!.id,
      attemptId,
      parsed.data.answers,
    );

    sendResponse(
      res,
      200,
      true,
      data.passed
        ? "Test passed. Certificate issued."
        : `Test failed with ${data.score}%. Passing score is 60%.`,
      data,
    );
  } catch (error) {
    next(error);
  }
};

const listCertificates = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await certificateService.listCertificatesFromDB(req.user!.id);
    sendResponse(res, 200, true, "Certificates fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const getCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await certificateService.getCertificateFromDB(
      req.user!.id,
      req.params.id,
    );
    sendResponse(res, 200, true, "Certificate fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const verifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await certificateService.verifyCertificateInDB(
      req.params.certNumber,
    );
    sendResponse(res, 200, true, "Certificate verified successfully", data);
  } catch (error) {
    next(error);
  }
};

export const certificateController = {
  startTest,
  submitTest,
  listCertificates,
  getCertificate,
  verifyCertificate,
};
