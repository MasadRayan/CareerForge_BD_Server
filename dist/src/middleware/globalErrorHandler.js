import multer from "multer";
import AppError from "../utils/AppError.js";
import sendResponse from "../utils/sendResponse.js";
const globalHandler = (err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return sendResponse(res, 400, false, 'File too large. Maximum size is 5MB.');
        }
        return sendResponse(res, 400, false, err.message);
    }
    if (err instanceof AppError) {
        return sendResponse(res, err.statusCode, false, err.message);
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return sendResponse(res, 500, false, message);
};
export default globalHandler;
//# sourceMappingURL=globalErrorHandler.js.map