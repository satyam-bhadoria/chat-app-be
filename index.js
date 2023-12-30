import express from "express";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerRoutes } from "./routes/index.js";
import { processMessage, socketMiddlewareAuth, markMessageRead, sendUnreadMsgDetails, initChat } from "./chat-socket.js";
import RedisContext from "./redis-helper.js";

RedisContext.connectRedis();

const app = express();
app.use(bodyParser.json());
registerRoutes(app);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

io.use(socketMiddlewareAuth);

io.on("connection", (socket) => {
  console.log('socket connection---> userId-->', socket.userId, '---socket id-->', socket.id);
  RedisContext.setChatSession(socket.userId, socket.id);

  sendUnreadMsgDetails(socket);

  socket.on('chat_initialize', async ({userId}, callback) => {
    console.log('chat initialization');
    let status = 'success';
    let message;
    let chatRoomId;
    try{
      chatRoomId = await initChat(socket, userId);
    } catch (err) {
      status = 'error';
      message = err.message;
    }
    callback({
      status,
      chatRoomId,
      message
    })
  });

  socket.on("client_message", async (incomingMsg) => {
    await processMessage(socket, incomingMsg);
  });
  socket.on("client_message_read", async (incomingMsg) => {
    await markMessageRead(socket, incomingMsg);
  });
  
  socket.on("disconnect", async () => {
    console.log('socket disconnected---> userId-->', socket.userId, '---socket id-->', socket.id);
    RedisContext.removeChatSession(socket.userId, socket.id);
  });
});

const port = process.env.PORT || '5005';
httpServer.listen(port, () => {
  console.log(`chat server started on ${port}`);
});

async function shutDown() {
  console.log('shutting down');
  try {
    await RedisContext.flushChatSockets();
    await RedisContext.disconnectRedis();
  } catch (e) {
    console.log ('error while disconnecting redis', e.message);
  }
  httpServer.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 1000);
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
process.on('unhandledRejection', (error) => {
  console.log('unhandled rejection', error);
});
process.on('uncaughtException', (error) => {
  console.log('uncaught exception', error);
});