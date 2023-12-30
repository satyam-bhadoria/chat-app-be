import { prisma } from '../prisma/prisma-client.js';

export const findChatRoomMapping = (chatRoomId, prismaCtx = prisma) =>
  prismaCtx.user_chatrooms_mapping.findMany({
    where: {
      chat_room_id: chatRoomId
    },
  })

export const insertUserChatRoomMapping = (data, prismaCtx = prisma) =>
  prismaCtx.user_chatrooms_mapping.createMany({
    data,
  }).catch((err) => {
    console.log(err);
  })
