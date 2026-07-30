import type { ReadinessScoreResponse, ReadinessHistoryItem } from "./readiness.interface.js";
export declare const readinessService: {
    calculateScore: (userId: string) => Promise<ReadinessScoreResponse>;
    getHistory: (userId: string) => Promise<ReadinessHistoryItem[]>;
};
//# sourceMappingURL=readiness.service.d.ts.map