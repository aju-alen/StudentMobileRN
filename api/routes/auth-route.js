import express from "express";
import {  register, verifyEmail,login,singleUser,updateMetadata,getTeacherProfile,changePassword,deleteAccount,updateProfileImage,verifyPurchase,getActiveStudentCourses,updateUserHasSeenOnboarding,registerSuperAdmin,loginSuperAdmin,zoomTest } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/register', register);
router.post('/super-admin/register', registerSuperAdmin);
router.get('/verify/:token', verifyEmail);
router.put(`/update-metadata`,verifyToken, updateMetadata)
router.put('/change-password', verifyToken, changePassword)
router.delete('/delete-account', verifyToken, deleteAccount)
router.get('/teacher/profile/:teacherProfileId', getTeacherProfile);
router.post('/login', login);
router.post('/super-admin/login', loginSuperAdmin);
router.get('/metadata',verifyToken, singleUser);
router.get('/metadata/verify-purchase/:subjectId',verifyToken, verifyPurchase);
router.put(`/update-profile/:uploadImage`,verifyToken,updateProfileImage)
router.get('/student/active-courses',verifyToken, getActiveStudentCourses )
router.put('/update-user-has-seen-onboarding', updateUserHasSeenOnboarding)

router.post('/zoom-test', verifyToken, zoomTest);

export default router;