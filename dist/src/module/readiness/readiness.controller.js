import sendResponse from "../../utils/sendResponse.js";
import { readinessService } from "./readiness.service.js";
const getScore = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await readinessService.calculateScore(userId);
        sendResponse(res, 200, true, "Readiness score calculated successfully", result);
    }
    catch (error) {
        next(error);
    }
};
const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const history = await readinessService.getHistory(userId);
        sendResponse(res, 200, true, `Fetched ${history.length} record(s) successfully`, history);
    }
    catch (error) {
        next(error);
    }
};
export const readinessController = { getScore, getHistory };
//# sourceMappingURL=readiness.controller.js.map