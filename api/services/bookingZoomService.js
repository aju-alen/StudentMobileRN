import { PrismaClient } from '@prisma/client';
import { createZoomMeeting } from './zoomService.js';

const prisma = new PrismaClient();

// Create Zoom meetings for any future bookings for this teacher that don't yet have Zoom details
export const createZoomMeetingsForTeacherBookings = async (teacherEmail) => {
  if (!teacherEmail) {
    console.log('No teacherEmail provided to createZoomMeetingsForTeacherBookings');
    return;
  }

  // Find the teacher by email
  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
  });

  if (!teacher) {
    console.log('No teacher found for email in Zoom webhook:', teacherEmail);
    return;
  }

  // Find bookings for this teacher that do not yet have Zoom meeting info
  const pendingBookings = await prisma.booking.findMany({
    where: {
      teacherId: teacher.id,
      bookingPaymentCompleted: true,
      bookingZoomId: null,
    },
    include: {
      subject: true,
      student: true,
    },
  });

  if (!pendingBookings.length) {
    console.log('No pending bookings without Zoom meeting for teacher:', teacherEmail);
    return;
  }

  for (const booking of pendingBookings) {
    try {
      // Construct start time from bookingDate and bookingTime (stored as separate fields)
      const datePart = booking.bookingDate.toISOString().split('T')[0];
      const timePart = booking.bookingTime; // assuming HH:mm
      const dateTimeString = `${datePart}T${timePart}:00+04:00`;
      const startTime = new Date(dateTimeString);

      const durationInMinutes =
        typeof booking.bookingMinutes === 'number' && booking.bookingMinutes > 0
          ? booking.bookingMinutes
          : (booking.bookingHours || 1) * 60;

      const topic =
        booking.subject?.subjectName ||
        `Lesson with ${teacher.name || teacher.email}`;

      const meeting = await createZoomMeeting(
        teacher.email,
        topic,
        startTime,
        durationInMinutes
      );

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          bookingZoomUrl: meeting.join_url,
          bookingZoomPassword: meeting.password || booking.bookingZoomPassword,
          bookingZoomId: meeting.id,
        },
      });

      console.log(
        `Created Zoom meeting ${meeting.id} for booking ${booking.id} (teacher ${teacher.email})`
      );
    } catch (err) {
      console.error(
        `Error creating Zoom meeting for booking ${booking.id} and teacher ${teacher.email}:`,
        err.response?.data || err.message
      );
    }
  }
};


