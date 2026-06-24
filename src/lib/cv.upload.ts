import type { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {

  const extension = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));

  if (
    ALLOWED_MIMETYPES.has(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF or DOCX files are allowed.", 400));
  }
};


export const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits:{
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
}).single("file");