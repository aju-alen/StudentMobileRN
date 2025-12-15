import { PrismaClient } from '@prisma/client';
import { EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createEnrollment = async (req, res, next) => {
  try {
    const { subjectId, studentId } = req.body;

    if (!subjectId || !studentId) {
      return res.status(400).json({ error: 'Missing required fields: subjectId and studentId' });
    }

    // Get subject and check if it's multi-student
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        courseType: true,
        maxCapacity: true,
        currentEnrollment: true,
        subjectVerification: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    if (subject.courseType !== 'MULTI_STUDENT') {
      return res.status(400).json({ error: 'This subject is not a multi-student course' });
    }

    if (!subject.subjectVerification) {
      return res.status(400).json({ error: 'This course has not been verified yet' });
    }

    // Check capacity
    if (subject.currentEnrollment >= subject.maxCapacity) {
      return res.status(400).json({ error: 'Course is full. No spots available.' });
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        subjectId_studentId: {
          subjectId,
          studentId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.enrollmentStatus === 'CANCELLED') {
        // Allow re-enrollment if previously cancelled
        const updatedEnrollment = await prisma.$transaction(async (tx) => {
          const enrollment = await tx.courseEnrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              enrollmentStatus: EnrollmentStatus.CONFIRMED,
              enrolledAt: new Date(),
            },
          });

          await tx.subject.update({
            where: { id: subjectId },
            data: {
              currentEnrollment: {
                increment: 1,
              },
            },
          });

          return enrollment;
        });

        return res.status(200).json({
          message: 'Enrollment created successfully',
          enrollment: updatedEnrollment,
        });
      } else {
        return res.status(400).json({ error: 'Student is already enrolled in this course' });
      }
    }

    // Create enrollment and increment count in transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.courseEnrollment.create({
        data: {
          subjectId,
          studentId,
          enrollmentStatus: EnrollmentStatus.CONFIRMED,
        },
      });

      await tx.subject.update({
        where: { id: subjectId },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      });

      return newEnrollment;
    });

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    next(error);
  }
};

export const getStudentEnrollments = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        enrollmentStatus: EnrollmentStatus.CONFIRMED,
      },
      include: {
        subject: {
          include: {
            teacherProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    next(error);
  }
};

export const getSubjectEnrollments = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        subjectId,
        enrollmentStatus: EnrollmentStatus.CONFIRMED,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching subject enrollments:', error);
    next(error);
  }
};

export const cancelEnrollment = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        subject: {
          select: {
            id: true,
            scheduledDateTime: true,
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.enrollmentStatus === 'CANCELLED') {
      return res.status(400).json({ error: 'Enrollment is already cancelled' });
    }

    // Check if course has already started (optional - can be removed if cancellation allowed anytime)
    if (enrollment.subject.scheduledDateTime && new Date(enrollment.subject.scheduledDateTime) < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel enrollment after course has started' });
    }

    // Cancel enrollment and decrement count in transaction
    const cancelledEnrollment = await prisma.$transaction(async (tx) => {
      const updated = await tx.courseEnrollment.update({
        where: { id: enrollmentId },
        data: {
          enrollmentStatus: EnrollmentStatus.CANCELLED,
        },
      });

      await tx.subject.update({
        where: { id: enrollment.subjectId },
        data: {
          currentEnrollment: {
            decrement: 1,
          },
        },
      });

      return updated;
    });

    res.status(200).json({
      message: 'Enrollment cancelled successfully',
      enrollment: cancelledEnrollment,
    });
  } catch (error) {
    console.error('Error cancelling enrollment:', error);
    next(error);
  }
};

export const getSubjectCapacity = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        courseType: true,
        maxCapacity: true,
        currentEnrollment: true,
        subjectVerification: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const availableSpots = Math.max(0, subject.maxCapacity - subject.currentEnrollment);

    res.status(200).json({
      courseType: subject.courseType,
      maxCapacity: subject.maxCapacity,
      currentEnrollment: subject.currentEnrollment,
      availableSpots,
      isFull: availableSpots === 0,
      isVerified: subject.subjectVerification,
    });
  } catch (error) {
    console.error('Error fetching subject capacity:', error);
    next(error);
  }
};



