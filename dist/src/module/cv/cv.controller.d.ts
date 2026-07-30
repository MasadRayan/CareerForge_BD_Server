import { NextFunction, Request, Response } from "express";
export declare const cvController: {
    createCV: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCVs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getASingleCV: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteASingleCV: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=cv.controller.d.ts.map