import express from "express";

import { verifyToken } from "../middlewares/jwt.js";
import { createPaymentIntent } from "../controllers/payment-controller.js";
const router = express.Router()

router.post('/intents',verifyToken, createPaymentIntent);

export default router;