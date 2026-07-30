import { NextFunction, Request, Response } from "express";
export declare const userController: {
    createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getASingleUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateASingleUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteASingleUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRoleOfUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=user.controller.d.ts.map