import express from 'express';
import {
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeeting,
} from '../controllers/zoomController.js';

const router = express.Router();

router.post('/create', createMeeting);
router.put('/update/:id', updateMeeting);
router.delete('/delete/:id', deleteMeeting);
router.get('/:id', getMeeting);

export default router;
