const sendResponse = (res, statusCode, success, message, data, error) => {
    return res.status(statusCode).json({
        success,
        ...(message !== undefined && { message }),
        ...(data !== undefined && { data }),
        ...(error !== undefined && { error })
    });
};
export default sendResponse;
//# sourceMappingURL=sendResponse.js.map