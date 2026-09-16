import express from "express";
import { createSubject,getAllSubjectsBySearch,getAllSubjects,getOneSubject,updateSubject,resubmitSubject,deleteSubject,getAllSubjectsToVerify,verifySubject,rejectSubject,getRecommendedSubjects,getSavedSubjects,saveSubject,unsaveSubject,getAllSubjectsByAdvanceSearch,getSubjectCapacity,getMultiStudentSubjects } from "../controllers/subject-controller.js";
import { verifyToken, requireRole } from "../middlewares/jwt.js";
const router = express.Router()

router.get('/',verifyToken, getAllSubjects);
router.get('/search',verifyToken, getAllSubjectsBySearch);
router.get('/advance-search',verifyToken, getAllSubjectsByAdvanceSearch);
router.get('/verify',verifyToken, requireRole('ADMIN'), getAllSubjectsToVerify);
router.get('/multi-student',verifyToken, getMultiStudentSubjects);
router.post('/create',verifyToken, createSubject);
router.get('/saved',verifyToken, getSavedSubjects);

router.put('/verify/:subjectId',verifyToken, requireRole('ADMIN'), verifySubject);
router.put('/reject/:subjectId',verifyToken, requireRole('ADMIN'), rejectSubject);
router.put('/resubmit/:subjectId',verifyToken, requireRole('TEACHER'), resubmitSubject);
router.get('/capacity/:subjectId',verifyToken, getSubjectCapacity);
router.post('/get-recommended-subjects',verifyToken, getRecommendedSubjects)
router.get('/:subjectId',verifyToken, getOneSubject);
router.post('/:subjectId',verifyToken, updateSubject);
router.delete('/:subjectId',verifyToken, deleteSubject);
router.post('/save/:subjectId',verifyToken, saveSubject);
router.delete('/saved/:subjectId',verifyToken, unsaveSubject);


export default router;