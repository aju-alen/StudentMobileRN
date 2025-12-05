import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { BookingStatus } from '@prisma/client';

export const getTeacherAvailability = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get all bookings for the teacher on the specified date
    const bookings = await prisma.booking.findMany({
      where: {
        teacherId,
        bookingDate: new Date(date),
        bookingStatus: {
          not: BookingStatus.CANCELLED
        }
      },
      select: {
        bookingTime: true
      }
    });

    // Get all dates where the teacher has bookings
    const bookedDates = await prisma.booking.findMany({
      where: {
        teacherId,
        bookingStatus: {
          not: BookingStatus.CANCELLED
        }
      },
      select: {
        bookingDate: true
      },
      distinct: ['bookingDate']
    });

    // Format the response
    const bookedSlots = bookings.map(booking => booking.bookingTime);
    const unavailableDates = bookedDates.map(date => date.bookingDate.toISOString().split('T')[0]);

    res.json({
      bookedSlots,
      unavailableDates
    });
  } catch (error) {
    console.error('Error fetching teacher availability:', error);
    res.status(500).json({ error: 'Failed to fetch teacher availability' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { teacherId, subjectId, studentId, date, time } = req.body;

    // Validate required fields
    if (!teacherId || !subjectId || !studentId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the time slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        teacherId,
        bookingDate: new Date(date),
        bookingTime: time,
        bookingStatus: {
          not: BookingStatus.CANCELLED
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Get subject price
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { subjectPrice: true }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        subjectId,
        studentId,
        bookingDate: new Date(date),
        bookingTime: time,
        bookingStatus: BookingStatus.PENDING,
        bookingPrice: subject.subjectPrice,
        bookingPaymentCompleted: false
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: status }
    });

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentCompleted } = req.body;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { bookingPaymentCompleted: paymentCompleted }
    });

    res.json(booking);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
}; 

export const getUpcomingClasses = async (req, res) => {
  try{
    const userId = req.userId;
    const userType = req.userType || (req.isTeacher ? 'TEACHER' : 'STUDENT');
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    // Get the profile ID from User.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          select: { id: true }
        },
        teacherProfile: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Determine which profile ID to use
    let profileId = null;
    if (userType === 'TEACHER' && user.teacherProfile) {
      profileId = user.teacherProfile.id;
    } else if (userType === 'STUDENT' && user.studentProfile) {
      profileId = user.studentProfile.id;
    } else {
      return res.status(400).json({ error: 'Profile not found' });
    }

    // Build where clause based on user type
    const whereClause = {
      bookingStatus: BookingStatus.CONFIRMED
    };

    if (userType === 'TEACHER') {
      whereClause.teacherId = profileId;
    } else {
      whereClause.studentId = profileId;
    }
    
    const upcomingClasses = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        bookingDate: true,
        bookingTime: true,
        bookingZoomUrl: true,
        subject: {
          select: {
            subjectName: true,
            id: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                id: true
              }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Transform response to match expected format
    const transformedClasses = upcomingClasses.map(booking => ({
      id: booking.id,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      bookingZoomUrl: booking.bookingZoomUrl,
      subject: booking.subject,
      teacher: {
        id: booking.teacher.user.id,
        name: booking.teacher.user.name
      },
      student: {
        id: booking.student.user.id,
        name: booking.student.user.name
      }
    }));

    res.status(200).json(transformedClasses);
  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch upcoming classes' });
  }
}

export const getStudentTeacherAvailability = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.userId;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Convert date string to start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get all bookings for the teacher on the specified date
    const teacherBookings = await prisma.booking.findMany({
      where: {
        teacherId,
        bookingDate: {
          gte: startDate,
          lte: endDate
        },
        bookingStatus: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING]
        }
      },
      select: {
        bookingTime: true,
        bookingHours: true
      }
    });

    // Get all bookings for the student on the specified date
    const studentBookings = await prisma.booking.findMany({
      where: {
        studentId,
        bookingDate: {
          gte: startDate,
          lte: endDate
        },
        bookingStatus: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING]
        }
      },
      select: {
        bookingTime: true,
        bookingHours: true
      }
    });

    // Helper function to generate all time slots for a booking
    const generateTimeSlots = (booking) => {
      const slots = [];
      const [startHour, startMinute] = booking.bookingTime.split(':').map(Number);
      
      // Include the end hour in the blocked slots
      for (let i = 0; i <= booking.bookingHours; i++) {
        const hour = (startHour + i) % 24;
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(timeSlot);
      }

      // Also block slots that would overlap with this booking
      // For example, if booking is 3 hours starting at 16:00, block 13:00, 14:00, 15:00
      for (let i = 1; i < booking.bookingHours; i++) {
        const hour = (startHour - i + 24) % 24; // Add 24 before modulo to handle negative numbers
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(timeSlot);
      }
      
      return slots;
    };

    // Generate all booked slots for both teacher and student
    const teacherBookedSlots = teacherBookings.flatMap(generateTimeSlots);
    const studentBookedSlots = studentBookings.flatMap(generateTimeSlots);

    // Combine both sets of booked slots and remove duplicates
    const bookedSlots = [...new Set([...teacherBookedSlots, ...studentBookedSlots])];

    // Get all dates where the teacher has bookings
    const teacherBookedDates = await prisma.booking.findMany({
      where: {
        teacherId,
        bookingStatus: {
          in: [BookingStatus.CONFIRMED]
        }
      },
      select: {
        bookingDate: true
      },
      distinct: ['bookingDate']
    });

    // Format unavailable dates
    const unavailableDates = teacherBookedDates.map(booking => 
      booking.bookingDate.toISOString().split('T')[0]
    );

    res.status(200).json({
      bookedSlots,
    });
  } catch (error) {
    console.error('Error in getStudentTeacherAvailability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};