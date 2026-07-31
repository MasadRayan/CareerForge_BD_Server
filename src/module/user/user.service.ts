import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreateUserInterFace, UpdateUserInterFace, UserRole } from "./user.interface";

const registerUserIntoDB = async (payload: CreateUserInterFace) => {
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

const getAllUserFromDB = async (page: number) => {
  const safePage = Math.max(1, Number(page) || 1);
  const limit = 10;

  const [users, totalItems] = await Promise.all([
    prisma.users.findMany({
      orderBy: {
        created_at: "desc",
      },
      skip: (safePage - 1) * limit,
      take: limit,
    }),
    prisma.users.count(),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    users,
    pagination: {
      currentPage: safePage,
      limit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
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

const getRoleOfUserFromDB = async(id: string) => {
    const userRole = await prisma.users.findUnique({
        where: {
            id,
        },
        select: {
            role: true,
        }
    })
    return userRole
}

const updateUserRoleFromDB = async (email: string, role: UserRole) => {
    const isUserExists = await prisma.users.findUnique({
        where: {
            email,
        },
    })

    if (!isUserExists) {
        throw new AppError("User not found", 404);
    }

    const user = await prisma.users.update({
        where: {
            email,
        },
        data: {
            role,
        },
    })

    return user;
}

export const userService = {
  registerUserIntoDB,
  getAllUserFromDB,
  getASingleUser,
  updateASingleUserInDB,
  deleteAUserFromDB,
  getRoleOfUserFromDB,
  updateUserRoleFromDB
};
