import express from "express";
import { createSubject } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/create',verifyToken, createSubject);

export default router;