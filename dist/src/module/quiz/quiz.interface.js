import { z } from "zod";
export const submitAttemptSchema = z.object({
    question_id: z.string().uuid("question_id must be a valid UUID"),
    selected_answer: z.enum(["a", "b", "c", "d"]).refine((v) => ["a", "b", "c", "d"].includes(v), { message: "selected_answer must be one of: a, b, c, d" }),
});
//# sourceMappingURL=quiz.interface.js.map