import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { parseCVText } from "../../lib/cv.parser";
import { uploadCVBuffer, deleteCVFile, publicIdFromUrl, } from "../../config/cloudinary";
const MAX_VERSIONS = 3;
const pruneOldVersions = async (userId) => {
    const versions = await prisma.cVs.findMany({
        where: { user_id: userId },
        orderBy: { version_number: "desc" },
        select: { id: true, file_url: true },
    });
    if (versions.length <= MAX_VERSIONS)
        return;
    const toRemove = versions.slice(MAX_VERSIONS);
    for (const v of toRemove) {
        const publicId = publicIdFromUrl(v.file_url);
        if (publicId)
            await deleteCVFile(publicId);
        await prisma.cVs.delete({ where: { id: v.id } });
    }
};
const createCVInDB = async (userId, file) => {
    const raw_text = await parseCVText(file.buffer, file.mimetype);
    const lastVersion = await prisma.cVs.findFirst({
        where: { user_id: userId },
        orderBy: { version_number: "desc" },
        select: { version_number: true },
    });
    const version_number = (lastVersion?.version_number ?? 0) + 1;
    const cv = await prisma.cVs.create({
        data: {
            user_id: userId,
            version_number,
            file_url: "",
            raw_text,
        },
    });
    const publicId = `cvs/${userId}/${cv.id}`;
    try {
        const file_url = await uploadCVBuffer(file.buffer, publicId);
        const updated = await prisma.cVs.update({
            where: { id: cv.id },
            data: { file_url },
        });
        await pruneOldVersions(userId);
        return updated;
    }
    catch (error) {
        await prisma.cVs.delete({ where: { id: cv.id } }).catch(() => { });
        throw new AppError("Failed to upload CV file. Please try again.", 502);
    }
};
const getAllCVsFromDB = async (userId) => {
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
const getASingleCV = async (userId, id) => {
    const cv = await prisma.cVs.findFirst({
        where: { id, user_id: userId },
    });
    if (!cv) {
        throw new AppError("CV not found", 404);
    }
    return cv;
};
const deleteCVFromDB = async (userId, id) => {
    const cv = await prisma.cVs.findFirst({
        where: { id, user_id: userId },
    });
    if (!cv) {
        throw new AppError("CV not found", 404);
    }
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
//# sourceMappingURL=cv.service.js.map