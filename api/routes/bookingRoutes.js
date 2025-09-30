import express from 'express';
import { 
  getTeacherAvailability, 
  createBooking, 
  updateBookingStatus, 
  updatePaymentStatus,
  getUpcomingClasses,
  getStudentTeacherAvailability
} from '../controllers/bookingController.js';
import { verifyToken } from '../middlewares/jwt.js';

const router = express.Router();

// Get teacher availability for a specific date
router.get('/upcoming-classes',verifyToken, getUpcomingClasses);


// Create a new booking
router.post('/', verifyToken, createBooking);

// Update booking status (PENDING, CONFIRMED, CANCELLED)
router.patch('/:bookingId/status', verifyToken, updateBookingStatus);

// Update payment status
router.patch('/:bookingId/payment', verifyToken, updatePaymentStatus);

router.get('/teacher/availability/:teacherId', verifyToken, getTeacherAvailability);

router.get('/available/:teacherId', verifyToken, getStudentTeacherAvailability);


export default router; 