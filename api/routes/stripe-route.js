import express from 'express';
const router = express.Router();
import { getPublisherKey, paymentSheet, stripeWebhook } from '../controllers/stripe-controller.js';
import { verifyToken } from '../middlewares/jwt.js';

router.get('/get-publisher-key', getPublisherKey);
router.post('/payment-sheet',verifyToken, paymentSheet);    
router.post('/webhook', stripeWebhook);    

export default router;