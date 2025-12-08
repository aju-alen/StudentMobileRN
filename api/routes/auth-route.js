import express from "express";
import {  register, verifyEmail,login,singleUser,updateMetadata,getTeacherProfile,changePassword,deleteAccount,updateProfileImage,verifyPurchase,getActiveStudentCourses,updateUserHasSeenOnboarding,registerSuperAdmin,loginSuperAdmin,zoomTest,verificationCheck,updateOrganizationTradeLicense,getOrganizationMembers,inviteTeacherToOrganization,getOrganizationInviteCode,refreshOrganizationInviteCode,joinOrganizationByInvite,removeTeacherFromOrganization } from "../controllers/auth-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.post('/register', register);
router.post('/super-admin/register', registerSuperAdmin);
router.get('/verify/:token', verifyEmail);
router.get('/metadata',verifyToken, singleUser);
router.put(`/update-metadata`,verifyToken, updateMetadata)
router.put('/change-password', verifyToken, changePassword)
router.delete('/delete-account', verifyToken, deleteAccount)
router.get('/teacher/profile/:teacherProfileId', getTeacherProfile);
router.post('/login', login);
router.post('/super-admin/login', loginSuperAdmin);
router.get('/metadata/verify-purchase/:subjectId',verifyToken, verifyPurchase);
router.put(`/update-profile/:uploadImage`,updateProfileImage)
router.get('/student/active-courses',verifyToken, getActiveStudentCourses )
router.put('/update-user-has-seen-onboarding', updateUserHasSeenOnboarding)
router.get('/verification-check', verifyToken, verificationCheck);
// Allow both authenticated and unauthenticated requests for trade license update
router.put('/organization/trade-license', updateOrganizationTradeLicense);
// Also support authenticated requests
router.put('/organization/trade-license-auth', verifyToken, updateOrganizationTradeLicense);
router.get('/organization/members', verifyToken, getOrganizationMembers);
router.post('/organization/invite', verifyToken, inviteTeacherToOrganization);
router.get('/organization/invite-code', verifyToken, getOrganizationInviteCode);
router.put('/organization/refresh-invite', verifyToken, refreshOrganizationInviteCode);
router.post('/organization/join', verifyToken, joinOrganizationByInvite);
router.post('/organization/remove-teacher', verifyToken, removeTeacherFromOrganization);

router.post('/zoom-test', verifyToken, zoomTest);

export default router;