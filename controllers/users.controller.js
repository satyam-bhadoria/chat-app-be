import { createUser, getChatUsers, getMyChats } from "../business/users.js";
import { errorResponse, successResponse } from "../helpers/response.helper.js";

export const getChatUsersController = async (req, res) => {
  try {
    const myId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    if (!myId) {
      throw new Error('missing loggedin user details');
    }
    const resData = await getChatUsers(myId);
    successResponse(res, resData);
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getChats = async (req, res) => {
  try {
    const myId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    if (!myId) {
      throw new Error('missing loggedin user details');
    }
    const chatRoomId = req.params.roomId;
    const resData = await getMyChats(myId, chatRoomId);
    successResponse(res, resData);
  } catch (err) {
    errorResponse(res, err);
  }
};

export const createUserController = async (req, res) => {
  try {
    const {
      body: data
    } = req;
    const resData = await createUser(data);
    successResponse(res, resData);
  } catch (err) {
    errorResponse(res, err);
  }
};
