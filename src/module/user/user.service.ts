import { email } from "zod";
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

const getAllUserFromDB = async (page : number) => {
    const users = await prisma.users.findMany({
        orderBy : {
            created_at : 'desc'
        },
        skip : (page - 1) * 10,
        take : 10
    })
    return users
}

const getASingleUser = async (email: string) => {
    const user = await prisma.users.findUnique({
        where: {
            email
        },
    })
    return user
}


export const userService = {
    registerUserIntoDB,
    getAllUserFromDB,
    getASingleUser
}