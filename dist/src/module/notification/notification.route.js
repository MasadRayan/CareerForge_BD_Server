import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.js";
const router = Router();
router.post("/reminder", verifyFBToken, verifyAdmin, notificationController.triggerReminder);
router.post("/expiry", verifyFBToken, verifyAdmin, notificationController.triggerExpiry);
export const notificationRouter = router;
//# sourceMappingURL=notification.route.js.map