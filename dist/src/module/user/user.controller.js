import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";
const createUser = async (req, res, next) => {
    try {
        const payload = req.body;
        const user = await userService.registerUserIntoDB(payload);
        sendResponse(res, 201, true, "User created successfully", user);
    }
    catch (error) {
        next(error);
    }
};
const getAllUsers = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const users = await userService.getAllUserFromDB(page);
        sendResponse(res, 200, true, "Users fetched successfully", users);
    }
    catch (error) {
        next(error);
    }
};
const getASingleUser = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await userService.getASingleUser(email);
        sendResponse(res, 200, true, "User fetched successfully", user);
    }
    catch (error) {
        next(error);
    }
};
const updateASingleUser = async (req, res, next) => {
    try {
        const email = req.params.email;
        const payload = req.body;
        const updatedUser = await userService.updateASingleUserInDB(email, payload);
        sendResponse(res, 200, true, "User updated successfully", updatedUser);
    }
    catch (error) {
        next(error);
    }
};
const deleteASingleUser = async (req, res, next) => {
    try {
        const email = req.params.email;
        const deleteUser = await userService.deleteAUserFromDB(email);
        sendResponse(res, 200, true, "User deleted successfully");
    }
    catch (error) {
        next(error);
    }
};
const getRoleOfUser = async (req, res, next) => {
    const id = req.user.id;
    try {
        const userRole = await userService.getRoleOfUserFromDB(id);
        sendResponse(res, 200, true, "User role fetched successfully", userRole);
    }
    catch (error) {
        next(error);
    }
};
export const userController = {
    createUser,
    getAllUsers,
    getASingleUser,
    updateASingleUser,
    deleteASingleUser,
    getRoleOfUser
};
//# sourceMappingURL=user.controller.js.map