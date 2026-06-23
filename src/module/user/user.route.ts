import { Router } from "express";
import { userController } from "./user.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";

const router = Router();

router.post("/register", userController.createUser);
router.get("/all", verifyFBToken, userController.getAllUsers);
router.get("/me/:email", verifyFBToken, userController.getASingleUser);
router.patch("/update/:email", verifyFBToken, userController.updateASingleUser);

export const userRouter = router;