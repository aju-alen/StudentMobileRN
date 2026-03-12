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

    // Only consider bookings from today onward (then filter by date+time in JS)
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    whereClause.bookingDate = { gte: startOfToday };
    
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
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Build start datetime (date + time) and keep only future classes
    const getStartDatetime = (bookingDate, bookingTime) => {
      if (!bookingDate) return null;
      const d = new Date(bookingDate);
      if (!bookingTime) return d;
      const parts = String(bookingTime).trim().split(':').map(Number);
      const h = Number.isNaN(parts[0]) ? 0 : parts[0];
      const m = parts[1] != null && !Number.isNaN(parts[1]) ? parts[1] : 0;
      d.setUTCHours(h, m, 0, 0);
      return d;
    };
    const futureClasses = upcomingClasses.filter(
      (b) => getStartDatetime(b.bookingDate, b.bookingTime) > now
    );
    const limited = limit != null ? futureClasses.slice(0, limit) : futureClasses;

    // Transform response to match expected format
    const transformedClasses = limited.map(booking => ({
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

/**
 * Resolve teacherId param (User.id or TeacherProfile.id) to TeacherProfile.id
 */
async function resolveTeacherProfileId(teacherIdParam) {
  if (!teacherIdParam) return null;
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherIdParam },
    select: { id: true },
  });
  if (teacherProfile) return teacherProfile.id;
  const user = await prisma.user.findUnique({
    where: { id: teacherIdParam },
    include: { teacherProfile: { select: { id: true } } },
  });
  return user?.teacherProfile?.id ?? null;
}

/**
 * Resolve User.id to StudentProfile.id
 */
async function resolveStudentProfileId(userId) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: { select: { id: true } } },
  });
  return user?.studentProfile?.id ?? null;
}

/**
 * Generate blocked time slots for a booking. Uses HH:mm format.
 * For SINGLE_STUDENT: 1-2 hours. Blocks start + (duration - 1) subsequent slots.
 */
function getBlockedSlotsForBooking(booking) {
  const slots = [];
  if (!booking?.bookingTime) return slots;
  const parts = String(booking.bookingTime).trim().split(':').map(Number);
  const startHour = Number.isNaN(parts[0]) ? 0 : parts[0];
  const durationHours = Math.max(1, booking.bookingHours ?? 1);
  for (let i = 0; i < durationHours; i++) {
    const hour = (startHour + i) % 24;
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export const getStudentTeacherAvailability = async (req, res) => {
  try {
    const { teacherId: teacherIdParam } = req.params;
    const userId = req.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const teacherProfileId = await resolveTeacherProfileId(teacherIdParam);
    const studentProfileId = await resolveStudentProfileId(userId);

    if (!teacherProfileId) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    if (!studentProfileId) {
      return res.status(400).json({ error: 'Student profile not found. Please ensure you are logged in as a student.' });
    }

    // Parse date explicitly (YYYY-MM-DD) to avoid timezone issues from new Date(date)
    const dateStr = String(date || '').trim().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    // Wider range to catch timezone edge cases when DB stores in local time
    const startWide = new Date(Date.UTC(year, month - 1, day, -12, 0, 0, 0));
    const endWide = new Date(Date.UTC(year, month - 1, day, 36, 0, 0, 0));

    const [teacherBookingsRaw, studentBookingsRaw] = await Promise.all([
      prisma.booking.findMany({
        where: {
          teacherId: teacherProfileId,
          bookingDate: { gte: startWide, lte: endWide },
          bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        select: { bookingTime: true, bookingHours: true, bookingDate: true },
      }),
      prisma.booking.findMany({
        where: {
          studentId: studentProfileId,
          bookingDate: { gte: startWide, lte: endWide },
          bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        select: { bookingTime: true, bookingHours: true, bookingDate: true },
      }),
    ]);

    // Filter to exact date by string comparison (handles any timezone storage)
    const onDate = (b) => b.bookingDate && b.bookingDate.toISOString().split('T')[0] === dateStr;
    const teacherBookings = teacherBookingsRaw.filter(onDate);
    const studentBookings = studentBookingsRaw.filter(onDate);

    const teacherBookedSlots = teacherBookings.flatMap(getBlockedSlotsForBooking);
    const studentBookedSlots = studentBookings.flatMap(getBlockedSlotsForBooking);
    const bookedSlots = [...new Set([...teacherBookedSlots, ...studentBookedSlots])];

    const teacherBookedDatesResult = await prisma.booking.findMany({
      where: {
        teacherId: teacherProfileId,
        bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      select: { bookingDate: true },
      distinct: ['bookingDate'],
    });
    const unavailableDates = teacherBookedDatesResult.map((b) =>
      b.bookingDate.toISOString().split('T')[0]
    );

    res.status(200).json({
      bookedSlots,
      unavailableDates,
    });
  } catch (error) {
    console.error('Error in getStudentTeacherAvailability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};