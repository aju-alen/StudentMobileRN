import express from "express";
import { createSubject,getAllSubjects,getOneSubject } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/create',verifyToken, createSubject);
router.get('/',verifyToken, getAllSubjects);
router.get('/:subjectId',verifyToken, getOneSubject);
router.get('/:subjectId',verifyToken, getOneSubject);

export default router;