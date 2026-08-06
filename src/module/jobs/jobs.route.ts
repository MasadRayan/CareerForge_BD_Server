import { Router } from "express";
import { jobsController } from "./jobs.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

router.get("/search", verifyFBToken, jobsController.searchJobs);
router.post("/refresh-w3schools", jobsController.refreshW3Schools);
router.post("/crawl", jobsController.crawl);

export const jobsRouter = router;