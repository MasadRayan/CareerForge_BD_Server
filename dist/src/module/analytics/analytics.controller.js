import { analyticsService } from './analytics.service.js';
import sendResponse from '../../utils/sendResponse.js';
const getUserStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await analyticsService.getUserStatus(userId);
        sendResponse(res, 200, true, 'User status retrieved successfully', result);
    }
    catch (error) {
        next(error);
    }
};
const getAdminAnalytics = async (_req, res, next) => {
    try {
        const result = await analyticsService.getAdminAnalytics();
        sendResponse(res, 200, true, 'Admin analytics retrieved successfully', result);
    }
    catch (error) {
        next(error);
    }
};
export const analyticsController = { getUserStatus, getAdminAnalytics };
//# sourceMappingURL=analytics.controller.js.map