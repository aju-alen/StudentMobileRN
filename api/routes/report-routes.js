import express from "express";
import { reportSubject,blockUser, getUserReports, getBlockedUsers, unblockUser } from "../controllers/report-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()


router.post('/create-report',verifyToken, reportSubject);
router.post('/block-user',verifyToken, blockUser);
router.get('/user', verifyToken, getUserReports);
router.get('/blocked-users', verifyToken, getBlockedUsers);
router.post('/unblock-user', verifyToken, unblockUser);


export default router;