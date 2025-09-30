import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTeacherAvailability = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;

    // Get all bookings for the teacher on the specified date
    const bookings = await prisma.booking.findMany({
      where: {
        teacherId,
        date: new Date(date),
        status: {
          not: 'cancelled'
        }
      },
      select: {
        time: true
      }
    });

    // Get teacher's unavailable dates
    const unavailableDates = await prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        date: {
          gte: new Date()
        }
      },
      select: {
        date: true
      }
    });

    const bookedSlots = bookings.map(booking => booking.time);
    const unavailableDatesList = unavailableDates.map(availability => 
      availability.date.toISOString().split('T')[0]
    );

    res.status(200).json({
      bookedSlots,
      unavailableDates: unavailableDatesList
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { teacherId, subjectId, studentId, date, time } = req.body;

    // Check if the slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        teacherId,
        date: new Date(date),
        time,
        status: {
          not: 'cancelled'
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentId,
        subjectId,
        date: new Date(date),
        time,
        status: 'pending'
      },
      include: {
        teacher: {
          select: {
            name: true,
            profileImage: true
          }
        },
        student: {
          select: {
            name: true,
            profileImage: true
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectImage: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const getTeacherBookings = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: {
        teacherId,
        date: {
          gte: new Date()
        }
      },
      include: {
        student: {
          select: {
            name: true,
            profileImage: true
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectImage: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const getStudentBookings = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: {
        studentId,
        date: {
          gte: new Date()
        }
      },
      include: {
        teacher: {
          select: {
            name: true,
            profileImage: true
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectImage: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status
      },
      include: {
        teacher: {
          select: {
            name: true,
            profileImage: true
          }
        },
        student: {
          select: {
            name: true,
            profileImage: true
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectImage: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Booking status updated successfully",
      booking
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const setTeacherAvailability = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { dates } = req.body;

    if (!Array.isArray(dates)) {
      return res.status(400).json({ message: "Dates must be an array" });
    }

    // Delete existing availability records for the teacher
    await prisma.teacherAvailability.deleteMany({
      where: {
        teacherId
      }
    });

    // Create new availability records
    const availability = await prisma.teacherAvailability.createMany({
      data: dates.map(date => ({
        teacherId,
        date: new Date(date)
      }))
    });

    res.status(200).json({
      message: "Teacher availability updated successfully",
      availability
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
}; 