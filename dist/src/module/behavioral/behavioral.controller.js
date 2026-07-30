import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import { behavioralService } from "./behavioral.service.js";
import { submitAnswerSchema } from "./behavioral.interface.js";
const getQuestions = async (req, res, next) => {
    try {
        const result = await behavioralService.getQuestionsFromDB({
            category: req.query.category,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
        });
        sendResponse(res, 200, true, `Fetched ${result.questions.length} question(s) successfully`, result);
    }
    catch (error) {
        next(error);
    }
};
const getQuestion = async (req, res, next) => {
    try {
        const question = await behavioralService.getQuestionFromDB(req.params.id);
        sendResponse(res, 200, true, "Question fetched successfully", question);
    }
    catch (error) {
        next(error);
    }
};
const submitAnswer = async (req, res, next) => {
    try {
        const parsed = submitAnswerSchema.safeParse(req.body);
        if (!parsed.success) {
            const messages = parsed.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ");
            throw new AppError(messages, 422);
        }
        const userId = req.user.id;
        const result = await behavioralService.submitAnswerToDB(userId, req.params.id, parsed.data);
        sendResponse(res, 201, true, "Answer submitted successfully", result);
    }
    catch (error) {
        next(error);
    }
};
const getAnswers = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const answers = await behavioralService.getAnswersFromDB(userId);
        sendResponse(res, 200, true, `Fetched ${answers.length} answer(s) successfully`, answers);
    }
    catch (error) {
        next(error);
    }
};
export const behavioralController = {
    getQuestions,
    getQuestion,
    submitAnswer,
    getAnswers,
};
//# sourceMappingURL=behavioral.controller.js.map