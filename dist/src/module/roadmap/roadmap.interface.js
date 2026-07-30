import { z } from "zod";
const resourceSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.enum(["video", "article", "docs", "course"]),
});
const weekSchema = z.object({
    week_number: z.number().int().min(1),
    topic_summary: z.string(),
    resources: z.array(resourceSchema),
    daily_tasks: z.array(z.string().min(1)).min(1),
});
export const roadmapResponseSchema = z.object({
    weeks: z.array(weekSchema).min(1),
});
//# sourceMappingURL=roadmap.interface.js.map