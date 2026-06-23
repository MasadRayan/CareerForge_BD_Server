import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreateUserInterFace } from "./user.interface";

const registerUserIntoDB = async (payload: CreateUserInterFace) => {
    const {name, email, experience_level, target_role } = payload;

    const isUserExists = await prisma.users.findUnique({
        where : {
            email
        }
    })

    if (isUserExists) {
        throw new AppError('User already exists', 400)
    }

    const user = await prisma.users.create({
        data : {
            name,
            email,
            experience_level,
            target_role
        }
    })

    return user 
}


export const userService = {
    registerUserIntoDB
}