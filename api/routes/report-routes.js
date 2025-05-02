import express from "express";
import { reportSubject,blockUser } from "../controllers/report-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()


router.post('/create-report',verifyToken, reportSubject);
router.post('/block-user',verifyToken, blockUser);


export default router;