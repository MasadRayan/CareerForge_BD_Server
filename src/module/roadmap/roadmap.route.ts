import { Router } from "express";
import { roadmapController } from "./roadmap.controller.js";
import { roadmapTestController } from "./roadmap.test.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.post("/", verifyFBToken, roadmapController.createRoadmap);
router.get("/", verifyFBToken, roadmapController.getAllRoadmaps);
router.get("/:id", verifyFBToken, roadmapController.getRoadmapById);
router.patch("/:id/tasks/:taskId", verifyFBToken, roadmapController.completeTask);
router.patch("/:id", verifyFBToken, roadmapController.updateRoadmapStatus);
router.delete("/:id", verifyFBToken, roadmapController.deleteRoadmap);

// Test system (weekly unlock tests + final exam)
router.get(
  "/:roadmapId/weeks/:weekId/test",
  verifyFBToken,
  roadmapTestController.getWeekTest,
);
router.post(
  "/:roadmapId/weeks/:weekId/test/submit",
  verifyFBToken,
  roadmapTestController.submitWeekTest,
);
router.get(
  "/:roadmapId/final-exam",
  verifyFBToken,
  roadmapTestController.getFinalExam,
);
router.post(
  "/:roadmapId/final-exam/submit",
  verifyFBToken,
  roadmapTestController.submitFinalExam,
);

export const roadmapRouter = router;
