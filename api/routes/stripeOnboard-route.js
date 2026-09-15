import express from "express";
import { linkOnboardAccount,onboardAccountCreate } from "../controllers/stripeOnboard-controller.js";
import { verifyToken, requireRole } from "../middlewares/jwt.js";
const router = express.Router()


router.post('/account', verifyToken, requireRole('TEACHER'), onboardAccountCreate);
router.post('/account_link', verifyToken, requireRole('TEACHER'), linkOnboardAccount);


export default router;