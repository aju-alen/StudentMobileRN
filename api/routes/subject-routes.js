import express from "express";
import { createSubject,getAllSubjectsBySearch,getAllSubjects,getOneSubject,updateSubject,deleteSubject,getAllSubjectsToVerify,verifySubject,getRecommendedSubjects,getSavedSubjects,saveSubject,unsaveSubject,getAllSubjectsByAdvanceSearch } from "../controllers/subject-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.get('/',verifyToken, getAllSubjects);
router.get('/search',verifyToken, getAllSubjectsBySearch);
router.get('/advance-search',verifyToken, getAllSubjectsByAdvanceSearch);
router.get('/verify',verifyToken, getAllSubjectsToVerify);
router.post('/create',verifyToken, createSubject);
router.get('/saved',verifyToken, getSavedSubjects);

router.put('/verify/:subjectId',verifyToken, verifySubject);
router.post('/get-recommended-subjects',verifyToken, getRecommendedSubjects)
router.get('/:subjectId',verifyToken, getOneSubject);
router.post('/:subjectId',verifyToken, updateSubject);
router.delete('/:subjectId',verifyToken, deleteSubject);
router.post('/save/:subjectId',verifyToken, saveSubject);
router.delete('/saved/:subjectId',verifyToken, unsaveSubject);


export default router;