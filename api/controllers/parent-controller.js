import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendEmailService } from '../services/emailService.js';
import {
  getStudentLearningProgressPayload,
  getStudentUpcomingClassesPayload,
} from './bookingController.js';

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  profileImage: true,
  email: true,
};

const conversationInclude = {
  parent: { include: { user: { select: userSelect } } },
  teacher: { include: { user: { select: userSelect } } },
  student: { include: { user: { select: userSelect } } },
  subject: {
    select: {
      id: true,
      subjectName: true,
      subjectImage: true,
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' },
    take: 1,
  },
};

const serializeParentConversation = (conversation) => ({
  id: conversation.id,
  kind: 'parent',
  isParentThread: true,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
  subjectId: conversation.subjectId,
  subject: conversation.subject,
  child: conversation.student?.user,
  childName: conversation.student?.user?.name,
  parent: conversation.parent?.user,
  teacher: conversation.teacher?.user,
  user: conversation.parent?.user,
  client: conversation.teacher?.user,
  lastMessage: conversation.messages?.[0] || null,
  messages: conversation.messages,
});

const getParentProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: { select: { id: true } } },
  });
  return user?.parentProfile || null;
};

const getStudentProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: { select: { id: true } } },
  });
  return user?.studentProfile || null;
};

const getTeacherProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { teacherProfile: { select: { id: true } } },
  });
  return user?.teacherProfile || null;
};

export const assertAcceptedLink = async (parentProfileId, studentProfileId) => {
  return prisma.parentStudentLink.findFirst({
    where: {
      parentProfileId,
      studentProfileId,
      status: 'ACCEPTED',
    },
  });
};

const studentHasConfirmedPurchase = async (studentProfileId, subjectId) => {
  const purchase = await prisma.stripePurchases.findFirst({
    where: {
      studentId: studentProfileId,
      subjectId,
      purchaseStatus: 'CONFIRMED',
    },
    select: { id: true },
  });
  if (purchase) return true;

  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      studentId: studentProfileId,
      subjectId,
      enrollmentStatus: 'CONFIRMED',
    },
    select: { id: true },
  });
  return Boolean(enrollment);
};

const isParentConversationParticipant = (conversation, userId) => {
  return Boolean(
    conversation &&
      (conversation.parent?.userId === userId || conversation.teacher?.userId === userId)
  );
};

export const inviteStudent = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      return res.status(400).json({ message: 'Please provide a student email' });
    }

    const studentUser = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: { select: { id: true } } },
    });

    if (!studentUser || studentUser.userType !== 'STUDENT' || !studentUser.studentProfile) {
      return res.status(404).json({ message: 'No student account was found with that email' });
    }

    const existing = await prisma.parentStudentLink.findUnique({
      where: {
        parentProfileId_studentProfileId: {
          parentProfileId: parentProfile.id,
          studentProfileId: studentUser.studentProfile.id,
        },
      },
    });

    if (existing?.status === 'ACCEPTED') {
      return res.status(409).json({ message: 'This student is already linked to your account' });
    }
    if (existing?.status === 'PENDING') {
      return res.status(409).json({ message: 'An invite is already pending for this student' });
    }

    const inviteToken = crypto.randomBytes(20).toString('hex');
    const link = existing
      ? await prisma.parentStudentLink.update({
          where: { id: existing.id },
          data: {
            status: 'PENDING',
            inviteToken,
            respondedAt: null,
          },
        })
      : await prisma.parentStudentLink.create({
          data: {
            parentProfileId: parentProfile.id,
            studentProfileId: studentUser.studentProfile.id,
            status: 'PENDING',
            inviteToken,
          },
        });

    const parentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    });

    await sendEmailService(
      studentUser.email,
      'A parent wants to link to your Coach Academ account',
      `<p>Hi ${studentUser.name},</p>
       <p>${parentUser?.name || 'A parent'} wants to link their Coach Academ parent account to yours so they can follow your classes and progress.</p>
       <p>Open the Coach Academ app and accept or reject this request from your profile.</p>`
    );

    return res.status(201).json({
      message: 'Invite sent. The student must accept before the link is active.',
      link: {
        id: link.id,
        status: link.status,
        student: {
          id: studentUser.id,
          name: studentUser.name,
          email: studentUser.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getChildren = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const links = await prisma.parentStudentLink.findMany({
      where: {
        parentProfileId: parentProfile.id,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        student: {
          include: {
            user: { select: userSelect },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const children = [];
    const pending = [];
    links.forEach((link) => {
      const item = {
        linkId: link.id,
        status: link.status,
        studentProfileId: link.studentProfileId,
        studentUserId: link.student.user.id,
        name: link.student.user.name,
        profileImage: link.student.user.profileImage,
        email: link.student.user.email,
        recommendedBoard: link.student.recommendedBoard,
        recommendedGrade: link.student.recommendedGrade,
      };
      if (link.status === 'ACCEPTED') children.push(item);
      else pending.push(item);
    });

    return res.status(200).json({ children, pending });
  } catch (err) {
    next(err);
  }
};

export const revokeLinkAsParent = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const link = await prisma.parentStudentLink.findFirst({
      where: { id: req.params.linkId, parentProfileId: parentProfile.id },
    });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await prisma.parentStudentLink.update({
      where: { id: link.id },
      data: { status: 'REVOKED', respondedAt: new Date() },
    });
    return res.status(200).json({ message: 'Student unlinked' });
  } catch (err) {
    next(err);
  }
};

export const getChildProgress = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: req.params.studentId },
      include: { studentProfile: true },
    });
    if (!studentUser?.studentProfile) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const linked = await assertAcceptedLink(parentProfile.id, studentUser.studentProfile.id);
    if (!linked) {
      return res.status(403).json({ message: 'You are not linked to this student' });
    }

    const payload = await getStudentLearningProgressPayload(studentUser.studentProfile.id);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

export const getChildUpcomingClasses = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: req.params.studentId },
      include: { studentProfile: true },
    });
    if (!studentUser?.studentProfile) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const linked = await assertAcceptedLink(parentProfile.id, studentUser.studentProfile.id);
    if (!linked) {
      return res.status(403).json({ message: 'You are not linked to this student' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const classes = await getStudentUpcomingClassesPayload(studentUser.studentProfile.id, limit);
    return res.status(200).json(classes);
  } catch (err) {
    next(err);
  }
};

export const getChatTargets = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(400).json({ message: 'Parent profile not found' });
    }

    const links = await prisma.parentStudentLink.findMany({
      where: { parentProfileId: parentProfile.id, status: 'ACCEPTED' },
      include: {
        student: {
          include: {
            user: { select: userSelect },
            stripePurchases: {
              where: { purchaseStatus: 'CONFIRMED' },
              include: {
                subject: {
                  include: {
                    teacherProfile: {
                      include: { user: { select: userSelect } },
                    },
                  },
                },
              },
            },
            courseEnrollments: {
              where: { enrollmentStatus: 'CONFIRMED' },
              include: {
                subject: {
                  include: {
                    teacherProfile: {
                      include: { user: { select: userSelect } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const targets = [];
    const seen = new Set();
    links.forEach((link) => {
      const courses = [
        ...(link.student.stripePurchases || []),
        ...(link.student.courseEnrollments || []),
      ];
      courses.forEach((entry) => {
        const subject = entry.subject;
        if (!subject?.teacherProfile?.user) return;
        const key = `${link.student.user.id}:${subject.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        targets.push({
          studentUserId: link.student.user.id,
          studentProfileId: link.student.id,
          studentName: link.student.user.name,
          subjectId: subject.id,
          subjectName: subject.subjectName,
          teacherUserId: subject.teacherProfile.user.id,
          teacherProfileId: subject.teacherProfile.id,
          teacherName: subject.teacherProfile.user.name,
          teacherProfileImage: subject.teacherProfile.user.profileImage,
        });
      });
    });

    return res.status(200).json(targets);
  } catch (err) {
    next(err);
  }
};

export const listParentConversations = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    const teacherProfile = await getTeacherProfile(req.userId);

    const where = parentProfile
      ? { parentProfileId: parentProfile.id }
      : teacherProfile
        ? { teacherProfileId: teacherProfile.id }
        : null;

    if (!where) {
      return res.status(200).json([]);
    }

    const conversations = await prisma.parentConversation.findMany({
      where,
      include: conversationInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json(conversations.map(serializeParentConversation));
  } catch (err) {
    next(err);
  }
};

export const createParentConversation = async (req, res, next) => {
  try {
    const parentProfile = await getParentProfile(req.userId);
    if (!parentProfile) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    const { studentUserId, subjectId } = req.body || {};
    if (!studentUserId || !subjectId) {
      return res.status(400).json({ message: 'studentUserId and subjectId are required' });
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: studentUserId },
      include: { studentProfile: { select: { id: true } } },
    });
    if (!studentUser?.studentProfile) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const linked = await assertAcceptedLink(parentProfile.id, studentUser.studentProfile.id);
    if (!linked) {
      return res.status(403).json({ message: 'You are not linked to this student' });
    }

    const purchased = await studentHasConfirmedPurchase(studentUser.studentProfile.id, subjectId);
    if (!purchased) {
      return res.status(403).json({ message: 'This student has not purchased that course' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { teacherId: true },
    });
    if (!subject) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const conversation = await prisma.parentConversation.upsert({
      where: {
        parentProfileId_teacherProfileId_studentProfileId_subjectId: {
          parentProfileId: parentProfile.id,
          teacherProfileId: subject.teacherId,
          studentProfileId: studentUser.studentProfile.id,
          subjectId,
        },
      },
      update: {},
      create: {
        parentProfileId: parentProfile.id,
        teacherProfileId: subject.teacherId,
        studentProfileId: studentUser.studentProfile.id,
        subjectId,
      },
      include: conversationInclude,
    });

    return res.status(200).json(serializeParentConversation(conversation));
  } catch (err) {
    next(err);
  }
};

export const getParentConversation = async (req, res, next) => {
  try {
    const conversation = await prisma.parentConversation.findUnique({
      where: { id: req.params.conversationId },
      include: {
        ...conversationInclude,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!isParentConversationParticipant(conversation, req.userId)) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    return res.status(200).json({
      ...serializeParentConversation(conversation),
      messages: conversation.messages,
    });
  } catch (err) {
    next(err);
  }
};

export const createParentMessage = async (req, res, next) => {
  try {
    const conversation = await prisma.parentConversation.findUnique({
      where: { id: req.params.conversationId },
      include: {
        parent: { select: { userId: true } },
        teacher: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!isParentConversationParticipant(conversation, req.userId)) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    const text = req.body?.text ?? req.body?.message;
    if (!text || (typeof text === 'string' && !text.trim())) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    const senderType = req.userType === 'TEACHER' ? 'TEACHER' : 'PARENT';
    const message = await prisma.parentConversationMessage.create({
      data: {
        senderId: req.userId,
        senderType,
        text: String(text).trim(),
        messageId: req.body?.messageId || crypto.randomUUID(),
        conversationId: conversation.id,
      },
    });

    await prisma.parentConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const listStudentParentInvites = async (req, res, next) => {
  try {
    const studentProfile = await getStudentProfile(req.userId);
    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found' });
    }

    const links = await prisma.parentStudentLink.findMany({
      where: {
        studentProfileId: studentProfile.id,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        parent: {
          include: { user: { select: userSelect } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(
      links.map((link) => ({
        linkId: link.id,
        status: link.status,
        parent: link.parent.user,
      }))
    );
  } catch (err) {
    next(err);
  }
};

const respondToInvite = async (req, res, next, status) => {
  try {
    const studentProfile = await getStudentProfile(req.userId);
    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found' });
    }

    const link = await prisma.parentStudentLink.findFirst({
      where: {
        id: req.params.id,
        studentProfileId: studentProfile.id,
        status: 'PENDING',
      },
    });
    if (!link) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    await prisma.parentStudentLink.update({
      where: { id: link.id },
      data: { status, respondedAt: new Date() },
    });
    return res.status(200).json({ message: status === 'ACCEPTED' ? 'Invite accepted' : 'Invite rejected' });
  } catch (err) {
    next(err);
  }
};

export const acceptParentInvite = (req, res, next) => respondToInvite(req, res, next, 'ACCEPTED');
export const rejectParentInvite = (req, res, next) => respondToInvite(req, res, next, 'REJECTED');

export const revokeLinkAsStudent = async (req, res, next) => {
  try {
    const studentProfile = await getStudentProfile(req.userId);
    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found' });
    }

    const link = await prisma.parentStudentLink.findFirst({
      where: { id: req.params.linkId, studentProfileId: studentProfile.id },
    });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await prisma.parentStudentLink.update({
      where: { id: link.id },
      data: { status: 'REVOKED', respondedAt: new Date() },
    });
    return res.status(200).json({ message: 'Parent unlinked' });
  } catch (err) {
    next(err);
  }
};

export const userIsParentConversationParticipant = async (userId, conversationId) => {
  const conversation = await prisma.parentConversation.findUnique({
    where: { id: conversationId },
    include: {
      parent: { select: { userId: true } },
      teacher: { select: { userId: true } },
    },
  });
  return isParentConversationParticipant(conversation, userId);
};
