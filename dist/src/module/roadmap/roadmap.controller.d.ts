import { NextFunction, Request, Response } from "express";
export declare const roadmapController: {
    createRoadmap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllRoadmaps: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRoadmapById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    completeTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateRoadmapStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteRoadmap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=roadmap.controller.d.ts.map