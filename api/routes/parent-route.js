import express from 'express';
import { verifyToken, requireRole } from '../middlewares/jwt.js';
import {
  inviteStudent,
  getChildren,
  revokeLinkAsParent,
  getChildProgress,
  getChildUpcomingClasses,
  getChatTargets,
  listParentConversations,
  createParentConversation,
  getParentConversation,
  createParentMessage,
} from '../controllers/parent-controller.js';

const router = express.Router();

router.post('/invites', verifyToken, requireRole('PARENT'), inviteStudent);
router.get('/children', verifyToken, requireRole('PARENT'), getChildren);
router.delete('/links/:linkId', verifyToken, requireRole('PARENT'), revokeLinkAsParent);
router.get('/children/:studentId/progress', verifyToken, requireRole('PARENT'), getChildProgress);
router.get('/children/:studentId/upcoming-classes', verifyToken, requireRole('PARENT'), getChildUpcomingClasses);
router.get('/chat-targets', verifyToken, requireRole('PARENT'), getChatTargets);
router.get('/conversations', verifyToken, requireRole('PARENT', 'TEACHER'), listParentConversations);
router.post('/conversations', verifyToken, requireRole('PARENT'), createParentConversation);
router.get('/conversations/:conversationId', verifyToken, requireRole('PARENT', 'TEACHER'), getParentConversation);
router.post('/conversations/:conversationId/messages', verifyToken, requireRole('PARENT', 'TEACHER'), createParentMessage);

export default router;
