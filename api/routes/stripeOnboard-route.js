import express from "express";
import { linkOnboardAccount,onboardAccountCreate } from "../controllers/stripeOnboard-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()


router.post('/account', onboardAccountCreate);
router.post('/account_link', linkOnboardAccount);


export default router;