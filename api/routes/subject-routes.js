import express from "express";
import { createSubject,getAllSubjects,getOneSubject,updateSubject,deleteSubject,getAllSubjectsToVerify,verifySubject } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.get('/verify',verifyToken, getAllSubjectsToVerify);
router.put('/verify/:subjectId',verifyToken, verifySubject);

router.get('/:subjectId',verifyToken, getOneSubject);
router.post('/:subjectId',verifyToken, updateSubject);
router.delete('/:subjectId',verifyToken, deleteSubject);

router.post('/create',verifyToken, createSubject);
router.get('/',verifyToken, getAllSubjects);

export default router;