import { Router } from "express";
import { quizController } from "./quiz.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.get("/", verifyFBToken, quizController.getQuestions);
router.get("/stats", verifyFBToken, quizController.getStats);
router.get("/history", verifyFBToken, quizController.getHistory);
router.post("/attempt", verifyFBToken, quizController.submitAttempt);

export const quizRouter = router;
