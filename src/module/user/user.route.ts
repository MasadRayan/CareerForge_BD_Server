import { Router } from "express";
import { userController } from "./user.controller";
import { verifyFBToken } from "../../middleware/verifyFBToken";
import { verifyAdmin } from "../../middleware/verifyAdmin";

const router = Router();

router.post("/register", userController.createUser);
router.get("/all", verifyFBToken, verifyAdmin, userController.getAllUsers);
router.get("/role",  userController.getRoleOfUser);
router.get("/me/:email", verifyFBToken, userController.getASingleUser);
router.patch("/update/:email", verifyFBToken, userController.updateASingleUser);
router.delete("/delete/:email", verifyFBToken, verifyAdmin, userController.deleteASingleUser);

export const userRouter = router;