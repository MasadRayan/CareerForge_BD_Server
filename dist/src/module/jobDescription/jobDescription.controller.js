import sendResponse from "../../utils/sendResponse";
import { jobDescriptionService } from "./jobDescription.service";
const createJobDescription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const payload = req.body;
        const jobDescription = await jobDescriptionService.createJobDescriptionIntoDB(userId, payload);
        sendResponse(res, 201, true, "Job description created successfully", jobDescription);
    }
    catch (error) {
        next(error);
    }
};
const getAllJobDescriptions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const jobDescriptions = await jobDescriptionService.getAllJobDescriptionsFromDB(userId);
        sendResponse(res, 200, true, "Job descriptions fetched successfully", jobDescriptions);
    }
    catch (error) {
        next(error);
    }
};
const getASingleJobDescription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const jobDescription = await jobDescriptionService.getASingleJobDescription(userId, id);
        sendResponse(res, 200, true, "Job description fetched successfully", jobDescription);
    }
    catch (error) {
        next(error);
    }
};
const updateASingleJobDescription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const payload = req.body;
        const updatedJobDescription = await jobDescriptionService.updateASingleJobDescriptionInDB(userId, id, payload);
        sendResponse(res, 200, true, "Job description updated successfully", updatedJobDescription);
    }
    catch (error) {
        next(error);
    }
};
const deleteASingleJobDescription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        await jobDescriptionService.deleteAJobDescriptionFromDB(userId, id);
        sendResponse(res, 200, true, "Job description deleted successfully");
    }
    catch (error) {
        next(error);
    }
};
export const jobDescriptionController = {
    createJobDescription,
    getAllJobDescriptions,
    getASingleJobDescription,
    updateASingleJobDescription,
    deleteASingleJobDescription,
};
//# sourceMappingURL=jobDescription.controller.js.map