import { Router } from "express";
import { jobDescriptionController } from "./jobDescription.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";

const router = Router();

// All routes require authentication. The user's identity comes from
// the verified Firebase token (req.user), not the URL — so a user can
// only ever access their own job descriptions.
router.post("/", verifyFBToken, jobDescriptionController.createJobDescription);
router.get("/", verifyFBToken, jobDescriptionController.getAllJobDescriptions);
router.get("/:id", verifyFBToken, jobDescriptionController.getASingleJobDescription);
router.patch("/:id", verifyFBToken, jobDescriptionController.updateASingleJobDescription);
router.delete("/:id", verifyFBToken, jobDescriptionController.deleteASingleJobDescription);

export const jobDescriptionRouter = router;
