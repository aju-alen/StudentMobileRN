import express from 'express';
import { verifyToken, requireRole } from '../middlewares/jwt.js';
import {
  listStudentParentInvites,
  acceptParentInvite,
  rejectParentInvite,
  revokeLinkAsStudent,
} from '../controllers/parent-controller.js';

const router = express.Router();

router.get('/parent-invites', verifyToken, requireRole('STUDENT'), listStudentParentInvites);
router.post('/parent-invites/:id/accept', verifyToken, requireRole('STUDENT'), acceptParentInvite);
router.post('/parent-invites/:id/reject', verifyToken, requireRole('STUDENT'), rejectParentInvite);
router.delete('/parent-links/:linkId', verifyToken, requireRole('STUDENT'), revokeLinkAsStudent);

export default router;
