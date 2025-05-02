import express from "express";
import { createReview, getSubjectReviews, voteReview } from "../controllers/review-controller.js";
import { verifyToken } from "../middlewares/jwt.js";

const router = express.Router();

// Create a new review
router.post('/', verifyToken, createReview);

// Get reviews for a subject
router.get('/subject/:subjectId', getSubjectReviews);

// Vote on a review
router.post('/:reviewId/vote', verifyToken, voteReview);

export default router; 