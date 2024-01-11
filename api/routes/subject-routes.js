import express from "express";
import { createSubject,getAllSubjects,getOneSubject,updateSubject,deleteSubject } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/create',verifyToken, createSubject);
router.get('/',verifyToken, getAllSubjects);
router.get('/:subjectId',verifyToken, getOneSubject);
router.post('/:subjectId',verifyToken, updateSubject);
router.delete('/:subjectId',verifyToken, deleteSubject);

export default router;