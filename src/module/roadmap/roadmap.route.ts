import { Router } from "express";
import { roadmapController } from "./roadmap.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.post("/", verifyFBToken, roadmapController.createRoadmap);
router.get("/", verifyFBToken, roadmapController.getAllRoadmaps);
router.get("/:id", verifyFBToken, roadmapController.getRoadmapById);
router.patch("/:id/tasks/:taskId", verifyFBToken, roadmapController.completeTask);
router.patch("/:id", verifyFBToken, roadmapController.updateRoadmapStatus);
router.delete("/:id", verifyFBToken, roadmapController.deleteRoadmap);

export const roadmapRouter = router;
