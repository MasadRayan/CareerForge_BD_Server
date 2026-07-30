import { type CreateRoadmapPayload, type UpdateRoadmapStatusPayload } from "./roadmap.interface.js";
export declare const roadmapService: {
    createRoadmapInDB: (userId: string, payload: CreateRoadmapPayload) => Promise<{
        weeks: ({
            resources: {
                type: import("../../../generated/prisma/enums.js").ResourceType;
                url: string;
                id: string;
                title: string;
                roadmap_week_id: string;
            }[];
            dailyTasks: {
                id: string;
                roadmap_week_id: string;
                description: string;
                is_completed: boolean;
                completed_at: Date | null;
            }[];
        } & {
            id: string;
            week_number: number;
            topic_summary: string;
            start_date: Date | null;
            end_date: Date | null;
            roadmap_id: string;
        })[];
    } & {
        id: string;
        created_at: Date;
        user_id: string;
        analysis_id: string;
        duration_weeks: number;
        status: import("../../../generated/prisma/enums.js").RoadmapStatus;
    }>;
    getAllRoadmapsFromDB: (userId: string) => Promise<{
        id: string;
        created_at: Date;
        analysis_id: string;
        duration_weeks: number;
        status: import("../../../generated/prisma/enums.js").RoadmapStatus;
    }[]>;
    getRoadmapFromDB: (userId: string, id: string) => Promise<{
        weeks: ({
            resources: {
                type: import("../../../generated/prisma/enums.js").ResourceType;
                url: string;
                id: string;
                title: string;
                roadmap_week_id: string;
            }[];
            dailyTasks: {
                id: string;
                roadmap_week_id: string;
                description: string;
                is_completed: boolean;
                completed_at: Date | null;
            }[];
        } & {
            id: string;
            week_number: number;
            topic_summary: string;
            start_date: Date | null;
            end_date: Date | null;
            roadmap_id: string;
        })[];
    } & {
        id: string;
        created_at: Date;
        user_id: string;
        analysis_id: string;
        duration_weeks: number;
        status: import("../../../generated/prisma/enums.js").RoadmapStatus;
    }>;
    completeTaskInDB: (userId: string, roadmapId: string, taskId: string) => Promise<{
        id: string;
        roadmap_week_id: string;
        description: string;
        is_completed: boolean;
        completed_at: Date | null;
    }>;
    updateRoadmapStatusInDB: (userId: string, id: string, payload: UpdateRoadmapStatusPayload) => Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        analysis_id: string;
        duration_weeks: number;
        status: import("../../../generated/prisma/enums.js").RoadmapStatus;
    }>;
    deleteRoadmapFromDB: (userId: string, id: string) => Promise<void>;
};
//# sourceMappingURL=roadmap.service.d.ts.map