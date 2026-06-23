import { email } from "zod";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreateUserInterFace, UpdateUserInterFace } from "./user.interface";

const registerUserIntoDB = async (payload: CreateUserInterFace) => {
  const { name, email, experience_level, target_role, photoURL } = payload;

  const isUserExists = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new AppError("User already exists", 400);
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

const getAllUserFromDB = async (page: number) => {
  const users = await prisma.users.findMany({
    orderBy: {
      created_at: "desc",
    },
    skip: (page - 1) * 10,
    take: 10,
  });
  return users;
};

const getASingleUser = async (email: string) => {
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

const updateASingleUserInDB = async (
  email: string,
  payload: UpdateUserInterFace,
) => {
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


const deleteAUserFromDB = async (email: string) => {
    const isUserExists = await prisma.users.findUnique({
        where: {
            email,
        },
    })

    if (!isUserExists) {
        throw new AppError("User not found", 404);
    }

    await prisma.users.delete({
        where: {
            email,
        }
    })
}

export const userService = {
  registerUserIntoDB,
  getAllUserFromDB,
  getASingleUser,
  updateASingleUserInDB,
  deleteAUserFromDB
};
