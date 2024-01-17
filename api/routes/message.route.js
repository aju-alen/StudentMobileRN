import express from "express";
import { getMessages,createMessage } from "../controllers/message-controller.js";
import { verifyToken } from "../middlewares/jwt.js";

const router = express.Router()

router.get('/:conversationId',verifyToken, getMessages);
router.post('/:conversationId',verifyToken, createMessage);

export default router;