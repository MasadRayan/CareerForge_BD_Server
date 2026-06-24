import type { Request } from "express";

export interface UploadCVInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface CVResponse {
  id: string;
  user_id: string;
  version_number: number;
  file_url: string;
  raw_text: string;
  uploaded_at: Date;
}


export interface CVRequest extends Request {
  file?: Express.Multer.File;
}
