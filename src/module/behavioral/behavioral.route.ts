import { Router } from "express";
import { behavioralController } from "./behavioral.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.get("/", verifyFBToken, behavioralController.getQuestions);
router.get("/answers", verifyFBToken, behavioralController.getAnswers);
router.get("/:id", verifyFBToken, behavioralController.getQuestion);
router.post("/:id/answer", verifyFBToken, behavioralController.submitAnswer);

export const behavioralRouter = router;
