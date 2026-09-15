import { BookingStatus, CourseType, EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { bookingDateStr, fromUaeDateTime } from '../utils/uaeDateTime.js';
import { sendNotificationByType } from './pushNotificationService.js';

const prisma = new PrismaClient();

const POLL_MS = 60 * 1000;
const WINDOW_START_MS = 4 * 60 * 1000;
const WINDOW_END_MS = 6 * 60 * 1000;

let reminderJobStarted = false;

const getBookingStart = (bookingDate, bookingTime) => {
  if (!bookingDate && !bookingTime) return null;
  const dateStr = bookingDateStr(bookingDate);
  if (dateStr && bookingTime) return fromUaeDateTime(dateStr, bookingTime);
  if (bookingDate) return new Date(bookingDate);
  return null;
};

const claimDispatch = async (sourceType, sourceId, startsAt) => {
  try {
    await prisma.classReminderDispatch.create({
      data: { sourceType, sourceId, startsAt },
    });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return false;
    }
    throw err;
  }
};

const notifyClassUsers = async ({ userIds, subjectName, subjectId, sourceType, sourceId }) => {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return;
  await sendNotificationByType('CLASS_REMINDER', {
    userIds: uniqueIds,
    subjectName,
    subjectId,
    sourceType,
    sourceId,
  });
};

const processConfirmedBookings = async (windowStart, windowEnd) => {
  const lookbehind = new Date(windowStart.getTime() - 24 * 60 * 60 * 1000);
  const lookahead = new Date(windowEnd.getTime() + 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      bookingStatus: BookingStatus.CONFIRMED,
      bookingDate: { gte: lookbehind, lte: lookahead },
    },
    select: {
      id: true,
      bookingDate: true,
      bookingTime: true,
      subject: { select: { id: true, subjectName: true } },
      student: { select: { userId: true } },
      teacher: { select: { userId: true } },
    },
  });

  for (const booking of bookings) {
    const startsAt = getBookingStart(booking.bookingDate, booking.bookingTime);
    if (!startsAt || startsAt < windowStart || startsAt > windowEnd) continue;
    const claimed = await claimDispatch('BOOKING', booking.id, startsAt);
    if (!claimed) continue;
    await notifyClassUsers({
      userIds: [booking.student?.userId, booking.teacher?.userId],
      subjectName: booking.subject?.subjectName,
      subjectId: booking.subject?.id,
      sourceType: 'BOOKING',
      sourceId: booking.id,
    });
  }
};

const processGroupSubjects = async (windowStart, windowEnd) => {
  const subjects = await prisma.subject.findMany({
    where: {
      courseType: CourseType.MULTI_STUDENT,
      scheduledDateTime: { gte: windowStart, lte: windowEnd },
    },
    select: {
      id: true,
      subjectName: true,
      scheduledDateTime: true,
      teacherProfile: { select: { userId: true } },
      courseEnrollments: {
        where: { enrollmentStatus: EnrollmentStatus.CONFIRMED },
        select: { student: { select: { userId: true } } },
      },
    },
  });

  for (const subject of subjects) {
    const startsAt = subject.scheduledDateTime ? new Date(subject.scheduledDateTime) : null;
    if (!startsAt) continue;
    const claimed = await claimDispatch('MULTI_STUDENT', subject.id, startsAt);
    if (!claimed) continue;
    const userIds = [
      subject.teacherProfile?.userId,
      ...subject.courseEnrollments.map((enrollment) => enrollment.student?.userId),
    ];
    await notifyClassUsers({
      userIds,
      subjectName: subject.subjectName,
      subjectId: subject.id,
      sourceType: 'MULTI_STUDENT',
      sourceId: subject.id,
    });
  }
};

const processPackageTopics = async (windowStart, windowEnd) => {
  const topics = await prisma.subjectTopic.findMany({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      subject: { courseType: CourseType.MULTI_PACKAGE },
    },
    select: {
      id: true,
      scheduledAt: true,
      topicTitle: true,
      subject: {
        select: {
          id: true,
          subjectName: true,
          teacherProfile: { select: { userId: true } },
          courseEnrollments: {
            where: { enrollmentStatus: EnrollmentStatus.CONFIRMED },
            select: { student: { select: { userId: true } } },
          },
        },
      },
    },
  });

  for (const topic of topics) {
    const startsAt = topic.scheduledAt ? new Date(topic.scheduledAt) : null;
    if (!startsAt) continue;
    const claimed = await claimDispatch('MULTI_PACKAGE_TOPIC', topic.id, startsAt);
    if (!claimed) continue;
    const userIds = [
      topic.subject?.teacherProfile?.userId,
      ...(topic.subject?.courseEnrollments || []).map((enrollment) => enrollment.student?.userId),
    ];
    const subjectName = topic.topicTitle
      ? `${topic.subject?.subjectName || 'Class'} — ${topic.topicTitle}`
      : topic.subject?.subjectName;
    await notifyClassUsers({
      userIds,
      subjectName,
      subjectId: topic.subject?.id,
      sourceType: 'MULTI_PACKAGE_TOPIC',
      sourceId: topic.id,
    });
  }
};

export const runClassReminders = async () => {
  const now = new Date();
  const windowStart = new Date(now.getTime() + WINDOW_START_MS);
  const windowEnd = new Date(now.getTime() + WINDOW_END_MS);
  await processConfirmedBookings(windowStart, windowEnd);
  await processGroupSubjects(windowStart, windowEnd);
  await processPackageTopics(windowStart, windowEnd);
};

export const startClassReminderJob = () => {
  if (reminderJobStarted) return;
  reminderJobStarted = true;
  const tick = async () => {
    try {
      await runClassReminders();
    } catch (err) {
      console.error('Class reminder job error:', err);
    }
  };
  tick();
  setInterval(tick, POLL_MS);
};
