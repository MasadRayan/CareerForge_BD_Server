import { Router } from "express";
import { readinessController } from "./readiness.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";
const router = Router();
router.get("/", verifyFBToken, readinessController.getScore);
router.get("/history", verifyFBToken, readinessController.getHistory);
export const readinessRouter = router;
//# sourceMappingURL=readiness.route.js.map