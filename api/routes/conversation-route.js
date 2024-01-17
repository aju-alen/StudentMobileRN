import express from "express";
import { getAllConversations,createConversation } from "../controllers/conversation-controller.js";
import { verifyToken } from "../middlewares/jwt.js";

const router = express.Router()

router.get('/',verifyToken, getAllConversations);
router.post('/',verifyToken, createConversation);

export default router;