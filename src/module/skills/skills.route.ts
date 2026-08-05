import { Router } from "express";
import { skillsController } from "./skills.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.post("/:id/skills", verifyFBToken, skillsController.extractSkills);

export const skillsRouter = router;
