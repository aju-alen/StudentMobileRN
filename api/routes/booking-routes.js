import express from "express";
import { verifyToken } from "../middlewares/jwt.js";
import {
  getTeacherAvailability,
  createBooking,
  getTeacherBookings,
  getStudentBookings,
  updateBookingStatus,
  setTeacherAvailability
} from "../controllers/booking-controller.js";

const router = express.Router();

// Get teacher availability
router.get('/teacher/availability/:teacherId', verifyToken, getTeacherAvailability);

// Create a new booking
router.post('/bookings', verifyToken, createBooking);

// Get teacher's bookings
router.get('/teacher/bookings/:teacherId', verifyToken, getTeacherBookings);

// Get student's bookings
router.get('/student/bookings/:studentId', verifyToken, getStudentBookings);

// Update booking status
router.put('/bookings/:bookingId', verifyToken, updateBookingStatus);

// Set teacher availability
router.post('/teacher/availability/:teacherId', verifyToken, setTeacherAvailability);

export default router; 