import RedisContext from "./redis-helper.js";
import { getChatRoomId, saveChat, saveChatMsgAsRead } from "./services/chat.service.js";
import { validateAuth } from "./helpers/validate-auth.js";
import { findChatRoomMapping, insertUserChatRoomMapping } from "./dao/chat_room.dao.js";
import { getUnreadMsgsCount } from "./dao/chat.dao.js";

export const socketMiddlewareAuth = async (socket, next) => {
  const accessToken = socket.handshake.auth.token;
  try{
    const userId = await validateAuth(accessToken);
    socket.userId = userId;
    next();
  } catch (err) {
    return next(new Error(err.message));
  }
}

export const initChat = async (socket, userId) => {
  const currUserId = socket.userId;
  const chatRoomId = getChatRoomId(currUserId, userId);
  const tempSet = new Set([currUserId, userId]);
  const mappingList = await findChatRoomMapping(chatRoomId);
  mappingList.forEach((rec) => {
    tempSet.delete(rec.user_id);
  });
  const payload = [];
  tempSet.forEach((userId) => {
    payload.push({
      user_id: userId,
      chat_room_id: chatRoomId,
    })
  });
  if (payload.length) {
    await insertUserChatRoomMapping(payload);
  }
  return chatRoomId;
}

export const sendUnreadMsgDetails = async (socket) => {
  const userId = socket.userId;
  const result = await getUnreadMsgsCount(userId);
  const unreadMsgCountList = [];
  result.forEach((res) => {
    unreadMsgCountList.push({
      chatRoomId: res.chat_room_id,
      count: res.unreadMsgCount
    });
  });
  socket.emit('server_unread_msg_count', unreadMsgCountList);
}

export const processMessage = async (socket, { msgTo, message }) => {
  const msgFrom = socket.userId;
  const msgRec = await saveChat(msgFrom, msgTo, message);
  let socketIds = await RedisContext.getChatSession(msgTo);
  socketIds = [...socketIds, ...(await RedisContext.getChatSession(msgFrom))];
  console.log('send message to =---->',socketIds);
  socketIds.forEach((socketId) => {
    socket.to(socketId).emit("server_message", {
      msgFrom,
      msgTo,
      messageId: msgRec.id.toString(),
      message,
      messageAt: msgRec.created_at,
    });
  });
};

export const markMessageRead = async (socket, { msgById, messageId }) => {
  const myId = socket.userId;
  console.log('marking msg as read');
  await saveChatMsgAsRead(msgById, myId, BigInt(messageId));
  // const task2 = updateMessageAt(msgFrom, messageId, readAt);
  // await Promise.all([task1, task2]);
  // socket.to(msgById).emit("server_message_read", {
  //   sender,
  //   recipient,
  //   messageId,
  //   readAt,
  // });
};
