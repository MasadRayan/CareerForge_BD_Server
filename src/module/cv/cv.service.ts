import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { parseCVText } from "../../lib/cv.parser";
import {
  uploadCVBuffer,
  deleteCVFile,
  publicIdFromUrl,
} from "../../config/cloudinary";
import type { UploadCVInput } from "./cv.interface";


const MAX_VERSIONS = 3;

const pruneOldVersions = async (userId: string): Promise<void> => {
  const versions = await prisma.cVs.findMany({
    where: { user_id: userId },
    orderBy: { version_number: "desc" },
    select: { id: true, file_url: true },
  });

  if (versions.length <= MAX_VERSIONS) return;

  const toRemove = versions.slice(MAX_VERSIONS);
  for (const v of toRemove) {
    const publicId = publicIdFromUrl(v.file_url);
    if (publicId) await deleteCVFile(publicId);
    await prisma.cVs.delete({ where: { id: v.id } });
  }
};


const createCVInDB = async (userId: string, file: UploadCVInput) => {
  // 1. Parse the CV text.
  const raw_text = await parseCVText(file.buffer, file.mimetype);

  // 2. Compute the next version number for this user.
  const lastVersion = await prisma.cVs.findFirst({
    where: { user_id: userId },
    orderBy: { version_number: "desc" },
    select: { version_number: true },
  });
  const version_number = (lastVersion?.version_number ?? 0) + 1;

  // 3. Persist the row first so we have a stable cvId for the file's
  //    public_id. file_url is updated after the Cloudinary upload.
  const cv = await prisma.cVs.create({
    data: {
      user_id: userId,
      version_number,
      file_url: "", // placeholder, set below
      raw_text,
    },
  });

  // 4. Upload the binary to Cloudinary. public_id = cvs/<userId>/<cvId>.
  const publicId = `cvs/${userId}/${cv.id}`;
  try {
    const file_url = await uploadCVBuffer(file.buffer, publicId);
    const updated = await prisma.cVs.update({
      where: { id: cv.id },
      data: { file_url },
    });

    // Bound storage: drop old versions beyond the cap.
    await pruneOldVersions(userId);

    return updated;
  } catch (error) {
    // Roll back the row so we never store a CV with an empty file_url.
    await prisma.cVs.delete({ where: { id: cv.id } }).catch(() => {});
    throw new AppError("Failed to upload CV file. Please try again.", 502);
  }
};

const getAllCVsFromDB = async (userId: string) => {
  // Omit raw_text from the list view — it can be large and isn't needed
  // when browsing versions. The single-CV endpoint returns it.
  const cvs = await prisma.cVs.findMany({
    where: { user_id: userId },
    orderBy: { version_number: "desc" },
    select: {
      id: true,
      version_number: true,
      file_url: true,
      uploaded_at: true,
    },
  });
  return cvs;
};

const getASingleCV = async (userId: string, id: string) => {
  const cv = await prisma.cVs.findFirst({
    where: { id, user_id: userId },
  });
  if (!cv) {
    throw new AppError("CV not found", 404);
  }
  return cv;
};

const deleteCVFromDB = async (userId: string, id: string) => {
  const cv = await prisma.cVs.findFirst({
    where: { id, user_id: userId },
  });
  if (!cv) {
    throw new AppError("CV not found", 404);
  }

  // Best-effort file deletion; the row is the source of truth.
  const publicId = publicIdFromUrl(cv.file_url);
  if (publicId) {
    await deleteCVFile(publicId);
  }

  await prisma.cVs.delete({ where: { id } });
};

export const cvService = {
  createCVInDB,
  getAllCVsFromDB,
  getASingleCV,
  deleteCVFromDB,
};
