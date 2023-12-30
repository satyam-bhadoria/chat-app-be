import { prisma } from '../prisma/prisma-client.js';

export const insertUser = (data, prismaCtx = prisma) =>
  prismaCtx.user.create({
    data
  })

export const getUsersByIds = (userIds, prismaCtx = prisma) =>
  prismaCtx.user.findMany({
    where: {
      id: {
        in: userIds,
      }
    }
  })