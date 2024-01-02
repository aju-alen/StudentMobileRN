import express from "express";
import { createSubject,getAllSubjects } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/create',verifyToken, createSubject);
router.get('',verifyToken, getAllSubjects);

export default router;