import { z } from "zod";
export const submitAnswerSchema = z.object({
    answer_text: z.string().min(1, "answer_text is required").max(5000),
});
//# sourceMappingURL=behavioral.interface.js.map