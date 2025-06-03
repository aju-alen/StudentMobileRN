import express from "express";
import {  register, verifyEmail,login,singleUser,updateMetadata,getTeacherProfile,changePassword,deleteAccount,updateProfileImage,verifyPurchase,getActiveStudentCourses,updateUserHasSeenOnboarding } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.put(`/update-metadata`,verifyToken, updateMetadata)
router.put('/change-password', verifyToken, changePassword)
router.delete('/delete-account', verifyToken, deleteAccount)
router.get('/teacher/profile/:teacherProfileId', getTeacherProfile);
router.post('/login', login);
router.get('/metadata',verifyToken, singleUser);
router.get('/metadata/verify-purchase/:subjectId',verifyToken, verifyPurchase);
router.put(`/update-profile/:uploadImage`,updateProfileImage)
router.get('/student/active-courses',verifyToken, getActiveStudentCourses )
router.put('/update-user-has-seen-onboarding', updateUserHasSeenOnboarding)

export default router;