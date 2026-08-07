import { Router } from "express";
import { certificateController } from "./certificate.controller.js";
import { verifyFBToken } from "../../middleware/verifyFBToken.js";

const router = Router();

// Public route (no auth) — verify a certificate by its code
router.get("/verify/:certNumber", certificateController.verifyCertificate);

// Authenticated routes — identity always comes from req.user
router.post("/test", verifyFBToken, certificateController.startTest);
router.post(
  "/test/:attemptId/submit",
  verifyFBToken,
  certificateController.submitTest,
);
router.get("/", verifyFBToken, certificateController.listCertificates);
router.get("/:id", verifyFBToken, certificateController.getCertificate);

export const certificateRouter = router;
