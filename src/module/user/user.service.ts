import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreateUserInterFace } from "./user.interface";

const registerUserIntoDB = async (payload: CreateUserInterFace) => {
    const {name, email, experience_level, target_role, photoURL } = payload;

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
            target_role,
            photoURL
        }
    })

    return user 
}

const getAllUserFromDB = async () => {
    const users = await prisma.users.findMany({
        orderBy : {
            created_at : 'desc'
        },
    })
    return users
}


export const userService = {
    registerUserIntoDB,
    getAllUserFromDB
}