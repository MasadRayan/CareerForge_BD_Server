import sendResponse from "../../utils/sendResponse";
import AppError from "../../utils/AppError";
import { cvService } from "./cv.service";
const createCV = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            throw new AppError("No file uploaded. Attach a PDF or DOCX file.", 400);
        }
        const userId = req.user.id;
        const cv = await cvService.createCVInDB(userId, {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
        });
        sendResponse(res, 201, true, "CV uploaded successfully", cv);
    }
    catch (error) {
        next(error);
    }
};
const getAllCVs = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cvs = await cvService.getAllCVsFromDB(userId);
        sendResponse(res, 200, true, "CVs fetched successfully", cvs);
    }
    catch (error) {
        next(error);
    }
};
const getASingleCV = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const cv = await cvService.getASingleCV(userId, id);
        sendResponse(res, 200, true, "CV fetched successfully", cv);
    }
    catch (error) {
        next(error);
    }
};
const deleteASingleCV = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        await cvService.deleteCVFromDB(userId, id);
        sendResponse(res, 200, true, "CV deleted successfully");
    }
    catch (error) {
        next(error);
    }
};
export const cvController = {
    createCV,
    getAllCVs,
    getASingleCV,
    deleteASingleCV,
};
//# sourceMappingURL=cv.controller.js.map