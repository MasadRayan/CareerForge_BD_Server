import { Router } from "express";
import { analysisController } from "./analysis.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.post("/", verifyFBToken, analysisController.createAnalysis);
router.get("/", verifyFBToken, analysisController.getAllAnalyses);
router.get("/:id", verifyFBToken, analysisController.getAnalysisById);
router.delete("/:id", verifyFBToken, analysisController.deleteAnalysis);

export const analysisRouter = router;
