import { saveChats, updateChats } from "../dao/chat.dao.js";

export const getChatRoomId = (userId1, userId2) => {
  return (userId1 < userId2 ? `PVT_${userId1}_${userId2}` : `PVT_${userId2}_${userId1}`);
}

export const saveChat = async (msgFrom, msgTo, message) => {
  const roomId = getChatRoomId(msgFrom, msgTo);
  const payload = {
    chat_room_id: roomId,
    sender_id: msgFrom,
    message
  };
  const chatRec = await saveChats(payload);
  return chatRec;
}

export const saveChatMsgAsRead = async (userId, currUserId, messageId) => {
  const chatRoomId = getChatRoomId(userId, currUserId);
  const payload = {
    is_read: true,
  };
  await updateChats(payload, {
    id: {
      lte: messageId
    },
    chat_room_id: chatRoomId,
    sender_id: userId,
  });
}
