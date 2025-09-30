import express from 'express';
const router = express.Router();
import { getPublisherKey, paymentSheet } from '../controllers/stripe-controller.js';
import { verifyToken } from '../middlewares/jwt.js';

router.get('/get-publisher-key', getPublisherKey);
router.post('/payment-sheet', paymentSheet);    
  

export default router;