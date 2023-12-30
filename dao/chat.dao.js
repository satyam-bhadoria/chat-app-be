import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/prisma-client.js';

export const getConnectedChatUsers = (userId, prismaCtx = prisma) =>
  prismaCtx.$queryRaw(
    Prisma.sql`SELECT u.*
    FROM public.user u
    JOIN user_chatrooms_mapping m ON u.id = m.user_id
    WHERE m.chat_room_id IN (
        SELECT chat_room_id
        FROM user_chatrooms_mapping
        WHERE user_id = ${userId}
    ) AND u.id != ${userId}`
  )

export const getMyChatsWithRecipient = (chatRoomId, prismaCtx = prisma) =>
  prismaCtx.chats.findMany({
    where: {
      chat_room_id: chatRoomId,
    },
    orderBy: [{
      id: 'desc',
    }],
    take: 30,
  })

export const getUnreadMsgsCount = async (userId, prismaCtx = prisma) =>
  prismaCtx.$queryRaw(
    Prisma.sql`SELECT chat_room_id, count(*) unreadMsgCount FROM chats WHERE chat_room_id IN (
      SELECT chat_room_id FROM user_chatrooms_mapping WHERE user_id = ${userId}
    ) AND sender_id != ${userId} AND is_read = false GROUP BY chat_room_id`
  )

export const saveChats = (data, prismaCtx = prisma) =>
  prismaCtx.chats.create({
    data,
  })

export const updateChats = (data, where, prismaCtx = prisma) =>
  prismaCtx.chats.updateMany({
    data,
    where,
  })