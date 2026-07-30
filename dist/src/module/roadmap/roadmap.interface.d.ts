import { z } from "zod";
export interface CreateRoadmapPayload {
    analysis_id: string;
    duration_weeks?: number;
}
export interface UpdateRoadmapStatusPayload {
    status: "active" | "completed" | "abandoned";
}
declare const weekSchema: z.ZodObject<{
    week_number: z.ZodNumber;
    topic_summary: z.ZodString;
    resources: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        type: z.ZodEnum<{
            video: "video";
            article: "article";
            docs: "docs";
            course: "course";
        }>;
    }, z.core.$strip>>;
    daily_tasks: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const roadmapResponseSchema: z.ZodObject<{
    weeks: z.ZodArray<z.ZodObject<{
        week_number: z.ZodNumber;
        topic_summary: z.ZodString;
        resources: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            url: z.ZodString;
            type: z.ZodEnum<{
                video: "video";
                article: "article";
                docs: "docs";
                course: "course";
            }>;
        }, z.core.$strip>>;
        daily_tasks: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GroqRoadmapResponse = z.infer<typeof roadmapResponseSchema>;
export type GroqRoadmapWeek = z.infer<typeof weekSchema>;
export {};
//# sourceMappingURL=roadmap.interface.d.ts.map