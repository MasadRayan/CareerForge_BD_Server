import { Router } from "express";
import { cvController } from "./cv.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";
import { uploadCV } from "../../lib/cv.upload";
const router = Router();
router.post("/", verifyFBToken, uploadCV, cvController.createCV);
router.get("/", verifyFBToken, cvController.getAllCVs);
router.get("/:id", verifyFBToken, cvController.getASingleCV);
router.delete("/:id", verifyFBToken, cvController.deleteASingleCV);
export const cvRouter = router;
//# sourceMappingURL=cv.route.js.map