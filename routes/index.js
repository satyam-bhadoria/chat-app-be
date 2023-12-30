import express from "express";
import { createUserController, getChatUsersController, getChats } from "../controllers/users.controller.js";
const router = express.Router();
const routerInternal = express.Router();

router.get('/users', getChatUsersController);
router.get('/:roomId', getChats);

routerInternal.post('/users', createUserController);

export const registerRoutes = (app) => {
  app.use('/v1/chats', router);
  app.use('/internal/v1/chats', routerInternal);
};
