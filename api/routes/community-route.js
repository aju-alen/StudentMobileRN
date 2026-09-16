import express from "express";
import { createCommunity,getAllCommunity,updateSingleCommunity,getOneCommunity} from '../controllers/community-controller.js';
import { verifyToken, requireRole } from "../middlewares/jwt.js";
const router = express.Router()

const communityRoles = requireRole('STUDENT', 'TEACHER', 'ADMIN');

router.get('/', verifyToken, communityRoles, getAllCommunity);
router.get('/:communityId', verifyToken, communityRoles, getOneCommunity);
router.post('/', verifyToken, requireRole('ADMIN'), createCommunity);
router.post('/:communityId', verifyToken, requireRole('STUDENT', 'TEACHER'), updateSingleCommunity);

export default router;