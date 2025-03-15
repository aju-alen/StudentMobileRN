import express from "express";
import {  register, verifyEmail,login,singleUser,updateProfileImage,getTeacherProfile } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.get('/teacher/profile/:teacherProfileId', getTeacherProfile);
router.post('/login', login);
router.get('/me',verifyToken, singleUser);
router.put(`/update-profile/:uploadImage`,updateProfileImage)

export default router;