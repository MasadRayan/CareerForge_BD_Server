import { Router } from "express";
import { jobDescriptionController } from "./jobDescription.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";
const router = Router();
router.post("/", verifyFBToken, jobDescriptionController.createJobDescription);
router.get("/", verifyFBToken, jobDescriptionController.getAllJobDescriptions);
router.get("/:id", verifyFBToken, jobDescriptionController.getASingleJobDescription);
router.patch("/:id", verifyFBToken, jobDescriptionController.updateASingleJobDescription);
router.delete("/:id", verifyFBToken, jobDescriptionController.deleteASingleJobDescription);
export const jobDescriptionRouter = router;
//# sourceMappingURL=jobDescription.route.js.map