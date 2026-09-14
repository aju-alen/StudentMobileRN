import express from 'express';
import {
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeeting,
} from '../controllers/zoomController.js';
import { verifyToken } from '../middlewares/jwt.js';

const router = express.Router();

router.post('/create', verifyToken, createMeeting);
router.put('/update/:id', verifyToken, updateMeeting);
router.delete('/delete/:id', verifyToken, deleteMeeting);
router.get('/:id', verifyToken, getMeeting);

export default router;
