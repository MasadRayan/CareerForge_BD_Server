import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  CreateJobDescriptionInterface,
  UpdateJobDescriptionInterface,
} from "./jobDescription.interface";

// NOTE: every query is scoped by `userId` so a user can only ever
// read / mutate their own job descriptions. The id comes from the
// verified Firebase token (req.user.id), never from the request body.
const createJobDescriptionIntoDB = async (
  userId: string,
  payload: CreateJobDescriptionInterface,
) => {
  const { title, raw_text, interview_date } = payload;

  const jobDescription = await prisma.jobDescriptions.create({
    data: {
      title,
      raw_text,
      user_id: userId,
      interview_date: interview_date ? new Date(interview_date) : null,
    },
  });

  return jobDescription;
};

const getAllJobDescriptionsFromDB = async (userId: string) => {
  const isUserExists = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  })

  if (!isUserExists) {
    throw new AppError("User not found", 404);
  }

  const jobDescriptions = await prisma.jobDescriptions.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return jobDescriptions;
};

const getASingleJobDescription = async (userId: string, id: string) => {
  
  const jobDescription = await prisma.jobDescriptions.findFirst({
    where: {
      id,
      user_id: userId,
    },
  });
  if (!jobDescription) {
    throw new AppError("Job description not found", 404);
  }
  return jobDescription;
};

const updateASingleJobDescriptionInDB = async (
  userId: string,
  id: string,
  payload: UpdateJobDescriptionInterface,
) => {
  const { title, raw_text, interview_date } = payload;

  const isJobDescriptionExists = await prisma.jobDescriptions.findFirst({
    where: {
      id,
      user_id: userId,
    },
  });

  if (!isJobDescriptionExists) {
    throw new AppError("Job description not found", 404);
  }

  const updatedJobDescription = await prisma.jobDescriptions.update({
    where: {
      id,
    },
    data: {
      title,
      raw_text,
      interview_date: interview_date ? new Date(interview_date) : undefined,
    },
  });

  return updatedJobDescription;
};

const deleteAJobDescriptionFromDB = async (userId: string, id: string) => {
  const isJobDescriptionExists = await prisma.jobDescriptions.findFirst({
    where: {
      id,
      user_id: userId,
    },
  });

  if (!isJobDescriptionExists) {
    throw new AppError("Job description not found", 404);
  }

  await prisma.jobDescriptions.delete({
    where: {
      id,
    },
  });
};

export const jobDescriptionService = {
  createJobDescriptionIntoDB,
  getAllJobDescriptionsFromDB,
  getASingleJobDescription,
  updateASingleJobDescriptionInDB,
  deleteAJobDescriptionFromDB,
};
