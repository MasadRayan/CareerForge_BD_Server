import { Router } from "express";
import { cvController } from "./cv.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";
import { uploadCV } from "../../lib/cv.upload";

const router = Router();

// All routes require authentication. The user's identity comes from the
// verified Firebase token (req.user), so a user can only access their own
// CVs. The upload route additionally parses the multipart file via multer
// (5MB cap, PDF/DOCX only) before the controller runs.
router.post("/", verifyFBToken, uploadCV, cvController.createCV);
router.get("/", verifyFBToken, cvController.getAllCVs);
router.get("/:id", verifyFBToken, cvController.getASingleCV);
router.delete("/:id", verifyFBToken, cvController.deleteASingleCV);

export const cvRouter = router;
