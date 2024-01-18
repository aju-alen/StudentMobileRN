import express from "express";
import { createSubject,getAllSubjects,getOneSubject,updateSubject,deleteSubject,getAllSubjectsToVerify,verifySubject } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.get('/',verifyToken, getAllSubjects);
router.get('/verify',verifyToken, getAllSubjectsToVerify);
router.post('/create',verifyToken, createSubject);

router.put('/verify/:subjectId',verifyToken, verifySubject);
router.get('/:subjectId',verifyToken, getOneSubject);
router.post('/:subjectId',verifyToken, updateSubject);
router.delete('/:subjectId',verifyToken, deleteSubject);


export default router;