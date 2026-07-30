import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
const registerUserIntoDB = async (payload) => {
    const { name, email, experience_level, target_role, photoURL } = payload;
    const isUserExists = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (isUserExists) {
        return isUserExists;
    }
    const user = await prisma.users.create({
        data: {
            name,
            email,
            experience_level,
            target_role,
            photoURL,
        },
    });
    return user;
};
const getAllUserFromDB = async (page) => {
    const users = await prisma.users.findMany({
        orderBy: {
            created_at: "desc",
        },
        skip: (page - 1) * 10,
        take: 10,
    });
    return users;
};
const getASingleUser = async (email) => {
    const user = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};
const updateASingleUserInDB = async (email, payload) => {
    const { name, experience_level, photoURL } = payload;
    const isUserExists = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (!isUserExists) {
        throw new AppError("User not found", 404);
    }
    await prisma.users.update({
        where: {
            email,
        },
        data: {
            name,
            experience_level,
            photoURL,
        },
    });
};
const deleteAUserFromDB = async (email) => {
    const isUserExists = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (!isUserExists) {
        throw new AppError("User not found", 404);
    }
    await prisma.users.delete({
        where: {
            email,
        }
    });
};
const getRoleOfUserFromDB = async (id) => {
    const userRole = await prisma.users.findUnique({
        where: {
            id,
        },
        select: {
            role: true,
        }
    });
    return userRole;
};
export const userService = {
    registerUserIntoDB,
    getAllUserFromDB,
    getASingleUser,
    updateASingleUserInDB,
    deleteAUserFromDB,
    getRoleOfUserFromDB
};
//# sourceMappingURL=user.service.js.map