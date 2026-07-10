import { Router } from "express";
import { quizController } from "./quiz.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

// All quiz routes require a valid Firebase token.

// GET /api/quiz?role_category=backend&difficulty=medium&limit=10
router.get("/", verifyFBToken, quizController.getQuestions);

// GET /api/quiz/stats  — must come BEFORE /:id to avoid conflict
router.get("/stats", verifyFBToken, quizController.getStats);

// GET /api/quiz/history
router.get("/history", verifyFBToken, quizController.getHistory);

// POST /api/quiz/attempt
router.post("/attempt", verifyFBToken, quizController.submitAttempt);

export const quizRouter = router;
