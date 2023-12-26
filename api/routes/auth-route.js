import express from "express";
import {  register, verifyEmail,login,singleUser } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.get('/me',verifyToken, singleUser);

export default router;