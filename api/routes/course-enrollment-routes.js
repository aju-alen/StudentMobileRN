import express from 'express';
import { verifyToken } from '../middlewares/jwt.js';
import {
  createEnrollment,
  getStudentEnrollments,
  getSubjectEnrollments,
  cancelEnrollment,
  getSubjectCapacity,
} from '../controllers/course-enrollment-controller.js';

const router = express.Router();

// Get subject capacity info
router.get('/capacity/:subjectId', getSubjectCapacity);

// Create enrollment (protected - requires auth)
router.post('/', verifyToken, createEnrollment);

// Get student enrollments
router.get('/student/:studentId', verifyToken, getStudentEnrollments);

// Get subject enrollments (for teachers to see enrolled students)
router.get('/subject/:subjectId', verifyToken, getSubjectEnrollments);

// Cancel enrollment
router.delete('/:enrollmentId', verifyToken, cancelEnrollment);

export default router;



