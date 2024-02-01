import express from "express";
import { getAllConversations,createConversation, getSingleConversation} from "../controllers/conversation-controller.js";
import { verifyToken } from "../middlewares/jwt.js";

const router = express.Router()

router.post('/',verifyToken, createConversation);
router.get('/:userId',verifyToken, getAllConversations);
router.get('/single/:conversationId',verifyToken, getSingleConversation);

export default router;