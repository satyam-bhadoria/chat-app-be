import { createClient } from 'redis';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

const CHAT_SOCKET_KEY = (userId) => `chat-socket:${userId}`;

export default class RedisContext {
  static async connectRedis() {
    await client.connect();
  }
  
  static async disconnectRedis() {
    await client.disconnect();
  }
  
  static async setChatSession(userId, socketId) {
    const redisKey = CHAT_SOCKET_KEY(userId);
    await client.sAdd(redisKey, socketId);
  }
  
  static async removeChatSession(userId, socketId) {
    const redisKey = CHAT_SOCKET_KEY(userId);
    client.sRem(redisKey, socketId);
  }
  
  static async getChatSession(userId) {
    const redisKey = CHAT_SOCKET_KEY(userId);
    return await client.sMembers(redisKey);
  }

  static async flushChatSockets(flush = true) {
    const keys = await client.keys('chat-socket:*');
    console.log('keys to delete', keys);
    if (flush && keys.length > 0) {
      await client.del(keys);
      console.log('redis keys deleted');
    }
  } 
}

