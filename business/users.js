import { prisma } from '../prisma/prisma-client.js';
import { insertUser, getUsersByIds } from '../dao/user.dao.js';
import { getConnectedChatUsers, getMyChatsWithRecipient } from '../dao/chat.dao.js';

export const getChatUsers = async (myId) => {
  const result = await getConnectedChatUsers(myId);
  return {
    listOfItems: result
  };
};

export const getMyChats = async (myId, chatRoomId) => {
  const chatList = await getMyChatsWithRecipient(chatRoomId);
  const result = [];
  chatList.forEach((chatRec) => {
    result.push({
      messageId: chatRec.id.toString(),
      message: chatRec.message,
      isSendByMe: chatRec.sender_id === myId,
      createdAt: chatRec.created_at,
      isMsgRead: chatRec.sender_id === myId ? true : chatRec.is_read,
    });
  });
  return {
    listOfItems: result,
  };
};

export const createUser = async (userData) => {
  const data = {
    id: userData.id,
    first_name: userData.firstName,
    last_name: userData.lastName,
    profile_pic: userData.profilePic,
  };
  await prisma.$transaction(async (prismaCtx) => {
    await insertUser(data, prismaCtx);
  });
};
