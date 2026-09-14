import express from "express";
import {  register, verifyEmail,login,singleUser,updateMetadata,getTeacherProfile,changePassword,forgotPassword,resetPassword,deleteAccount,updateProfileImage,verifyPurchase,getActiveStudentCourses,updateUserHasSeenOnboarding,loginSuperAdmin,registerPushToken,zoomTest,verificationCheck,resendZoomInviteEmail,updateOrganizationTradeLicense,updateOrganizationCapacity,getOrganizationMembers,inviteTeacherToOrganization,getOrganizationInviteCode,refreshOrganizationInviteCode,createOrganization,deleteOrganization,joinOrganizationByInvite,removeTeacherFromOrganization } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
import { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../middlewares/rateLimit.js";
const router = express.Router()

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.get('/metadata',verifyToken, singleUser);
router.put(`/update-metadata`,verifyToken, updateMetadata)
router.put('/change-password', verifyToken, changePassword)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', resetPasswordLimiter, resetPassword)
router.delete('/delete-account', verifyToken, deleteAccount)
router.get('/teacher/profile/:teacherProfileId', getTeacherProfile);
router.post('/login', loginLimiter, login);
router.post('/super-admin/login', loginLimiter, loginSuperAdmin);
router.get('/metadata/verify-purchase/:subjectId',verifyToken, verifyPurchase);
router.put('/update-profile', verifyToken, updateProfileImage)
router.get('/student/active-courses',verifyToken, getActiveStudentCourses )
router.put('/update-user-has-seen-onboarding', verifyToken, updateUserHasSeenOnboarding)
router.get('/verification-check', verifyToken, verificationCheck);
router.post('/resend-zoom-invite', verifyToken, resendZoomInviteEmail);
router.put('/organization/trade-license', verifyToken, updateOrganizationTradeLicense);
router.put('/organization/trade-license-auth', verifyToken, updateOrganizationTradeLicense);
router.get('/organization/members', verifyToken, getOrganizationMembers);
router.post('/organization/invite', verifyToken, inviteTeacherToOrganization);
router.get('/organization/invite-code', verifyToken, getOrganizationInviteCode);
router.put('/organization/refresh-invite', verifyToken, refreshOrganizationInviteCode);
router.post('/organization/create', verifyToken, createOrganization);
router.delete('/organization', verifyToken, deleteOrganization);
router.post('/organization/join', verifyToken, joinOrganizationByInvite);
router.post('/organization/remove-teacher', verifyToken, removeTeacherFromOrganization);
router.put('/organization/capacity', verifyToken, updateOrganizationCapacity);

router.post('/zoom-test', verifyToken, zoomTest);
router.put('/push-token', verifyToken, registerPushToken);

export default router;