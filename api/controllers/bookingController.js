import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { BookingStatus, EnrollmentStatus } from '@prisma/client';
import {
  bookingDateStr,
  expandHourSlots,
  fromUaeDateTime,
  slotsFromInstant,
} from '../utils/uaeDateTime.js';

const getStartDatetime = (bookingDate, bookingTime) => {
  if (!bookingDate && !bookingTime) return null;
  const dateStr = bookingDateStr(bookingDate);
  if (dateStr && bookingTime) return fromUaeDateTime(dateStr, bookingTime);
  if (bookingDate) return new Date(bookingDate);
  return null;
};

const hoursForBooking = (booking) => {
  const fromBooking = Number(booking.bookingHours);
  if (Number.isFinite(fromBooking) && fromBooking > 0) return fromBooking;
  const fromTopic = Number(booking.subjectTopic?.hours);
  if (Number.isFinite(fromTopic) && fromTopic > 0) return fromTopic;
  const fromSubject = Number(booking.subject?.subjectDuration);
  if (Number.isFinite(fromSubject) && fromSubject > 0) return fromSubject;
  return 0;
};

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

    const teacherProfileId = await resolveTeacherProfileId(teacherId);
    const studentProfileId = (await resolveStudentProfileId(studentId)) || studentId;
    const dateStr = String(date).trim().split('T')[0];
    const occupied = await getPairOccupiedSlots(teacherProfileId, studentProfileId, dateStr);
    const requested = requestedSlotsFor(time, 1);
    if (hasSlotOverlap(requested, occupied)) {
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

    const futureClasses = upcomingClasses.filter(
      (b) => {
        const startsAt = getStartDatetime(b.bookingDate, b.bookingTime);
        return startsAt && startsAt > now;
      }
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
export async function resolveTeacherProfileId(teacherIdParam) {
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
export async function resolveStudentProfileId(userId) {
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
  if (!booking?.bookingTime) return [];
  return expandHourSlots(booking.bookingTime, Math.max(1, booking.bookingHours ?? 1));
}

function collectScheduledSlots(dateTime, durationHours, dateStr, bucket) {
  if (!dateTime) return;
  const { dateStr: scheduledDate, slots } = slotsFromInstant(dateTime, durationHours);
  if (scheduledDate !== dateStr) return;
  bucket.push(...slots);
}

/**
 * Returns blocked hour slots (HH:mm) for a teacher on a given date.
 * Used by subject-controller for server-side availability check.
 */
/**
 * Returns blocked hour slots (HH:mm) for a teacher on a given date.
 * Includes 1:1 bookings from every student, plus the tutor's group classes.
 */
export async function getTeacherBlockedSlotsForDate(teacherProfileId, dateStr, db = prisma) {
  if (!teacherProfileId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];
  const [year, month, day] = dateStr.split('-').map(Number);
  const startWide = new Date(Date.UTC(year, month - 1, day, -12, 0, 0, 0));
  const endWide = new Date(Date.UTC(year, month - 1, day, 36, 0, 0, 0));
  const onDate = (d) => bookingDateStr(d) === dateStr;

  const bookingsRaw = await db.booking.findMany({
    where: {
      teacherId: teacherProfileId,
      bookingDate: { gte: startWide, lte: endWide },
      bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
    select: { bookingTime: true, bookingHours: true, bookingDate: true },
  });
  const bookingSlots = bookingsRaw.filter((b) => onDate(b.bookingDate)).flatMap(getBlockedSlotsForBooking);

  const multiStudentSubjects = await db.subject.findMany({
    where: {
      teacherId: teacherProfileId,
      courseType: 'MULTI_STUDENT',
      scheduledDateTime: { not: null },
    },
    select: { scheduledDateTime: true, subjectDuration: true },
  });
  const multiStudentSlots = [];
  for (const sub of multiStudentSubjects) {
    collectScheduledSlots(sub.scheduledDateTime, Math.max(1, Math.min(2, sub.subjectDuration ?? 1)), dateStr, multiStudentSlots);
  }

  const topicsRaw = await db.subjectTopic.findMany({
    where: {
      subject: { teacherId: teacherProfileId },
      scheduledAt: { not: null },
    },
    select: { scheduledAt: true, hours: true },
  });
  const topicSlots = [];
  for (const t of topicsRaw) {
    collectScheduledSlots(t.scheduledAt, Math.max(1, Math.min(3, t.hours ?? 1)), dateStr, topicSlots);
  }

  return [...new Set([...bookingSlots, ...multiStudentSlots, ...topicSlots])];
}

/**
 * Returns blocked hour slots for a student on a given date.
 * Includes their 1:1 bookings with any tutor, plus group classes they enrolled in.
 */
export async function getStudentOccupiedSlots(studentProfileId, dateStr, db = prisma) {
  if (!studentProfileId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];
  const [year, month, day] = dateStr.split('-').map(Number);
  const startWide = new Date(Date.UTC(year, month - 1, day, -12, 0, 0, 0));
  const endWide = new Date(Date.UTC(year, month - 1, day, 36, 0, 0, 0));
  const onDate = (d) => bookingDateStr(d) === dateStr;

  const bookingsRaw = await db.booking.findMany({
    where: {
      studentId: studentProfileId,
      bookingDate: { gte: startWide, lte: endWide },
      bookingStatus: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
    select: { bookingTime: true, bookingHours: true, bookingDate: true },
  });
  const bookingSlots = bookingsRaw.filter((b) => onDate(b.bookingDate)).flatMap(getBlockedSlotsForBooking);

  const enrollments = await db.courseEnrollment.findMany({
    where: {
      studentId: studentProfileId,
      enrollmentStatus: EnrollmentStatus.CONFIRMED,
    },
    include: {
      subject: {
        select: {
          courseType: true,
          scheduledDateTime: true,
          subjectDuration: true,
          subjectTopics: { select: { scheduledAt: true, hours: true } },
        },
      },
    },
  });

  const groupSlots = [];
  for (const enrollment of enrollments) {
    const subject = enrollment.subject;
    if (!subject) continue;
    if (subject.courseType === 'MULTI_STUDENT') {
      collectScheduledSlots(subject.scheduledDateTime, Math.max(1, Math.min(2, subject.subjectDuration ?? 1)), dateStr, groupSlots);
    }
    if (subject.courseType === 'MULTI_PACKAGE') {
      for (const topic of subject.subjectTopics || []) {
        collectScheduledSlots(topic.scheduledAt, Math.max(1, Math.min(3, topic.hours ?? 1)), dateStr, groupSlots);
      }
    }
  }

  return [...new Set([...bookingSlots, ...groupSlots])];
}

export async function getPairOccupiedSlots(teacherProfileId, studentProfileId, dateStr, db = prisma) {
  const [teacherSlots, studentSlots] = await Promise.all([
    getTeacherBlockedSlotsForDate(teacherProfileId, dateStr, db),
    getStudentOccupiedSlots(studentProfileId, dateStr, db),
  ]);
  return [...new Set([...teacherSlots, ...studentSlots])];
}

export function requestedSlotsFor(time, durationHours) {
  return expandHourSlots(time, durationHours);
}

export function hasSlotOverlap(requested, occupied) {
  const blocked = new Set(occupied);
  return requested.some((slot) => blocked.has(slot));
}

export async function findSlotConflict({
  teacherProfileId,
  studentProfileId,
  dateStr,
  time,
  durationHours,
  extraOccupied = [],
  db = prisma,
}) {
  const requested = requestedSlotsFor(time, durationHours);
  const occupied = [
    ...(await getPairOccupiedSlots(teacherProfileId, studentProfileId, dateStr, db)),
    ...extraOccupied,
  ];
  return hasSlotOverlap(requested, occupied);
}

export async function lockBookingProfiles(tx, teacherProfileId, studentProfileId) {
  if (teacherProfileId) {
    await tx.$queryRaw`SELECT id FROM TeacherProfile WHERE id = ${teacherProfileId} FOR UPDATE`;
  }
  if (studentProfileId) {
    await tx.$queryRaw`SELECT id FROM StudentProfile WHERE id = ${studentProfileId} FOR UPDATE`;
  }
}

/**
 * Get the current teacher's own availability (for subject creation).
 * Returns blocked slots from: Bookings, MULTI_STUDENT subject scheduledDateTime, MULTI_PACKAGE topic scheduledAt.
 */
export const getMyTeacherAvailability = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const teacherProfileId = await resolveTeacherProfileId(userId);
    if (!teacherProfileId) {
      return res.status(400).json({ error: 'Teacher profile not found' });
    }

    const dateStr = String(date || '').trim().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const bookedSlots = await getTeacherBlockedSlotsForDate(teacherProfileId, dateStr);
    res.status(200).json({ bookedSlots, unavailableDates: [] });
  } catch (error) {
    console.error('Error in getMyTeacherAvailability:', error);
    res.status(500).json({ error: 'Failed to fetch teacher availability' });
  }
};

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

    const bookedSlots = await getPairOccupiedSlots(teacherProfileId, studentProfileId, dateStr);
    res.status(200).json({
      bookedSlots,
      unavailableDates: [],
    });
  } catch (error) {
    console.error('Error in getStudentTeacherAvailability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

const buildCourseProgress = ({ subject, bookings = [], now, isTeacher = false }) => {
  const topics = [...(subject.subjectTopics || [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const courseType = subject.courseType || 'SINGLE_STUDENT';
  const totalHours = Number(subject.subjectDuration) || topics.reduce((sum, topic) => sum + (Number(topic.hours) || 0), 0);

  const datedBookings = bookings.map((booking) => ({
    ...booking,
    startsAt: getStartDatetime(booking.bookingDate, booking.bookingTime),
  }));
  const completedBookings = datedBookings.filter((booking) => booking.startsAt && booking.startsAt.getTime() < now.getTime());
  const upcomingBookings = datedBookings.filter((booking) => booking.startsAt && booking.startsAt.getTime() >= now.getTime());

  let totalClasses = 0;
  let completedClasses = 0;
  let hoursCompleted = 0;

  if (courseType === 'MULTI_PACKAGE' && topics.length > 0) {
    totalClasses = topics.length;
    completedClasses = topics.filter((topic) => {
      if (topic.scheduledAt && new Date(topic.scheduledAt).getTime() < now.getTime()) return true;
      return completedBookings.some((booking) => booking.subjectTopicId === topic.id);
    }).length;
    hoursCompleted = topics.reduce((sum, topic) => {
      const pastBySchedule = topic.scheduledAt && new Date(topic.scheduledAt).getTime() < now.getTime();
      const pastByBooking = completedBookings.some((booking) => booking.subjectTopicId === topic.id);
      return (pastBySchedule || pastByBooking) ? sum + (Number(topic.hours) || 0) : sum;
    }, 0);
  } else if (courseType === 'SINGLE_PACKAGE' && topics.length > 0) {
    totalClasses = topics.length;
    const completedTopicIds = new Set(
      completedBookings.map((booking) => booking.subjectTopicId).filter(Boolean)
    );
    completedClasses = completedTopicIds.size;
    hoursCompleted = completedBookings.reduce((sum, booking) => sum + hoursForBooking(booking), 0);
  } else if (courseType === 'MULTI_STUDENT') {
    totalClasses = 1;
    const scheduledAt = subject.scheduledDateTime ? new Date(subject.scheduledDateTime) : null;
    const sessionPast = scheduledAt && scheduledAt.getTime() < now.getTime();
    completedClasses = sessionPast || completedBookings.length > 0 ? 1 : 0;
    hoursCompleted = completedClasses ? (hoursForBooking(completedBookings[0] || {}) || totalHours) : 0;
  } else {
    if (isTeacher) {
      totalClasses = datedBookings.length || (totalHours > 0 ? 1 : 0);
      completedClasses = completedBookings.length;
      hoursCompleted = completedBookings.reduce((sum, booking) => sum + hoursForBooking(booking), 0);
    } else {
      totalClasses = 1;
      completedClasses = completedBookings.length > 0 ? 1 : 0;
      hoursCompleted = completedBookings.reduce((sum, booking) => sum + hoursForBooking(booking), 0);
      if (!hoursCompleted && completedClasses && totalHours) hoursCompleted = totalHours;
    }
  }

  const lastSessionAt = completedBookings
    .map((booking) => booking.startsAt)
    .concat(topics.filter((topic) => topic.scheduledAt && new Date(topic.scheduledAt).getTime() < now.getTime()).map((topic) => new Date(topic.scheduledAt)))
    .concat(subject.scheduledDateTime && new Date(subject.scheduledDateTime).getTime() < now.getTime() ? [new Date(subject.scheduledDateTime)] : [])
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0] || null;

  const nextSessionAt = upcomingBookings
    .map((booking) => booking.startsAt)
    .concat(topics.filter((topic) => topic.scheduledAt && new Date(topic.scheduledAt).getTime() >= now.getTime()).map((topic) => new Date(topic.scheduledAt)))
    .concat(subject.scheduledDateTime && new Date(subject.scheduledDateTime).getTime() >= now.getTime() ? [new Date(subject.scheduledDateTime)] : [])
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime())[0] || null;

  const progress = totalClasses > 0 ? Math.min(100, Math.round((completedClasses / totalClasses) * 100)) : 0;
  const studentCount = isTeacher
    ? (subject.courseEnrollments?.length
      || new Set(bookings.map((booking) => booking.studentId).filter(Boolean)).size
      || Number(subject.currentEnrollment)
      || 0)
    : undefined;

  return {
    subjectId: subject.id,
    subjectName: subject.subjectName,
    courseType,
    progress,
    completedClasses,
    totalClasses,
    hoursCompleted,
    totalHours,
    lastSessionAt: lastSessionAt ? lastSessionAt.toISOString() : null,
    nextSessionAt: nextSessionAt ? nextSessionAt.toISOString() : null,
    studentCount,
  };
};

export const getLearningProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const userType = req.userType || (req.isTeacher ? 'TEACHER' : 'STUDENT');
    const now = new Date();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isTeacher = userType === 'TEACHER' && !!user.teacherProfile;
    const profileId = isTeacher ? user.teacherProfile.id : user.studentProfile?.id;

    if (!profileId) {
      return res.status(200).json({
        isTeacher: false,
        overview: {
          totalCourses: 0,
          completedCourses: 0,
          completedClasses: 0,
          upcomingClasses: 0,
          hoursCompleted: 0,
        },
        courses: [],
      });
    }

    const bookingInclude = {
      subjectTopic: { select: { id: true, hours: true } },
      subject: { select: { subjectDuration: true } },
    };

    let courses = [];

    if (isTeacher) {
      const [subjects, bookings] = await Promise.all([
        prisma.subject.findMany({
          where: { teacherId: profileId },
          include: {
            subjectTopics: { orderBy: { orderIndex: 'asc' } },
            courseEnrollments: {
              where: { enrollmentStatus: EnrollmentStatus.CONFIRMED },
              select: { studentId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.findMany({
          where: {
            teacherId: profileId,
            bookingStatus: BookingStatus.CONFIRMED,
          },
          include: bookingInclude,
        }),
      ]);

      const bookingsBySubject = new Map();
      bookings.forEach((booking) => {
        const list = bookingsBySubject.get(booking.subjectId) || [];
        list.push(booking);
        bookingsBySubject.set(booking.subjectId, list);
      });

      courses = subjects.map((subject) =>
        buildCourseProgress({
          subject,
          bookings: bookingsBySubject.get(subject.id) || [],
          now,
          isTeacher: true,
        })
      );
    } else {
      const [userSubjects, enrollments, bookings] = await Promise.all([
        prisma.userSubject.findMany({
          where: { studentId: profileId },
          include: {
            subject: {
              include: {
                subjectTopics: { orderBy: { orderIndex: 'asc' } },
              },
            },
          },
        }),
        prisma.courseEnrollment.findMany({
          where: {
            studentId: profileId,
            enrollmentStatus: EnrollmentStatus.CONFIRMED,
          },
          include: {
            subject: {
              include: {
                subjectTopics: { orderBy: { orderIndex: 'asc' } },
              },
            },
          },
        }),
        prisma.booking.findMany({
          where: {
            studentId: profileId,
            bookingStatus: BookingStatus.CONFIRMED,
          },
          include: bookingInclude,
        }),
      ]);

      const subjectMap = new Map();
      userSubjects.forEach((entry) => {
        if (entry.subject) subjectMap.set(entry.subject.id, entry.subject);
      });
      enrollments.forEach((entry) => {
        if (entry.subject) subjectMap.set(entry.subject.id, entry.subject);
      });

      const bookingsBySubject = new Map();
      bookings.forEach((booking) => {
        const list = bookingsBySubject.get(booking.subjectId) || [];
        list.push(booking);
        bookingsBySubject.set(booking.subjectId, list);
      });

      courses = [...subjectMap.values()].map((subject) =>
        buildCourseProgress({
          subject,
          bookings: bookingsBySubject.get(subject.id) || [],
          now,
          isTeacher: false,
        })
      );
    }

    const overview = {
      totalCourses: courses.length,
      completedCourses: courses.filter((course) => course.progress === 100).length,
      completedClasses: courses.reduce((sum, course) => sum + course.completedClasses, 0),
      upcomingClasses: courses.filter((course) => course.nextSessionAt).length,
      hoursCompleted: courses.reduce((sum, course) => sum + course.hoursCompleted, 0),
    };

    return res.status(200).json({
      isTeacher,
      overview,
      courses,
    });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
};