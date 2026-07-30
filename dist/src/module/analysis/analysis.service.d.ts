import type { CreateAnalysisPayload, AnalysisListItem, AnalysisResponse } from "./analysis.interface.js";
export declare const analysisService: {
    createAnalysisInDB: (userId: string, payload: CreateAnalysisPayload) => Promise<AnalysisResponse>;
    getAllAnalysesFromDB: (userId: string) => Promise<AnalysisListItem[]>;
    getAnalysisFromDB: (userId: string, id: string) => Promise<AnalysisResponse>;
    deleteAnalysisFromDB: (userId: string, id: string) => Promise<void>;
};
//# sourceMappingURL=analysis.service.d.ts.map