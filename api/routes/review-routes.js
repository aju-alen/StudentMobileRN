import express from "express";
import { createReview, getSubjectReviews } from "../controllers/review-controller.js";
import { verifyToken } from "../middlewares/jwt.js";

const router = express.Router();

// Create a new review
router.post('/', verifyToken, createReview);

// Get reviews for a specific subject
router.get('/subject/:subjectId', verifyToken, getSubjectReviews);

export default router; 