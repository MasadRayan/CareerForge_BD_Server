import type { Response } from "express";
declare const sendResponse: <T>(res: Response, statusCode: number, success: boolean, message?: string, data?: T, error?: T) => Response<any, Record<string, any>>;
export default sendResponse;
//# sourceMappingURL=sendResponse.d.ts.map