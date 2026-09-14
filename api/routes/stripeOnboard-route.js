import express from "express";
import { linkOnboardAccount,onboardAccountCreate } from "../controllers/stripeOnboard-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()


router.post('/account', verifyToken, onboardAccountCreate);
router.post('/account_link', verifyToken, linkOnboardAccount);


export default router;