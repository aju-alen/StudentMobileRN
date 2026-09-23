import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { userIsParentConversationParticipant } from '../controllers/parent-controller.js';
import { normalizeDirectChatMessage, toConversationMessageCreate } from '../utils/chatMessages.js';

const prisma = new PrismaClient();

let count = 0;

const getUserProfiles = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: { select: { id: true } },
      teacherProfile: { select: { id: true } },
    },
  });
};

const userIsConversationParticipant = async (userId, conversationId) => {
  const user = await getUserProfiles(userId);
  if (!user) return false;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentId: true, teacherId: true },
  });
  if (!conversation) return false;

  return (
    (user.studentProfile && conversation.studentId === user.studentProfile.id) ||
    (user.teacherProfile && conversation.teacherId === user.teacherProfile.id)
  );
};

const userIsCommunityMember = async (userId, communityId) => {
  const user = await getUserProfiles(userId);
  if (!user) return false;

  const orConditions = [];
  if (user.studentProfile) {
    orConditions.push({ studentId: user.studentProfile.id });
  }
  if (user.teacherProfile) {
    orConditions.push({ teacherId: user.teacherProfile.id });
  }
  if (orConditions.length === 0) return false;

  const membership = await prisma.communityUser.findFirst({
    where: {
      communityId,
      OR: orConditions,
    },
    select: { id: true },
  });

  return !!membership;
};

export const initializeSocket = (server, allowedOrigins = []) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins.length
        ? allowedOrigins
        : [
            'http://localhost:8081',
            'http://localhost:19000',
            'http://localhost:19006',
          ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (typeof socket.handshake.headers?.authorization === 'string'
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return next(new Error('Authentication required'));
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
      if (err || !payload?.userId) {
        return next(new Error('Invalid token'));
      }
      socket.userId = payload.userId;
      socket.userType = payload.userType;
      next();
    });
  });

  io.on('connection', (socket) => {
    count++;
    console.log('socket connected', socket.id, 'user', socket.userId);

    socket.on('send-chat-details', async (data) => {
      try {
        if (!data?.clientId || !data?.subjectId) {
          socket.emit('chat-details-error', { error: 'Missing chat details' });
          return;
        }

        // Authenticated user must be the student party
        if (data.userId && data.userId !== socket.userId) {
          socket.emit('chat-details-error', { error: 'Unauthorized' });
          return;
        }

        const studentUser = await prisma.user.findUnique({
          where: { id: socket.userId },
          include: {
            studentProfile: { select: { id: true } },
          },
        });

        if (!studentUser?.studentProfile) {
          socket.emit('chat-details-error', { error: 'Student profile not found' });
          return;
        }

        const teacherUser = await prisma.user.findUnique({
          where: { id: data.clientId },
          include: {
            teacherProfile: { select: { id: true } },
          },
        });

        if (!teacherUser?.teacherProfile) {
          socket.emit('chat-details-error', { error: 'Teacher profile not found' });
          return;
        }

        const studentProfileId = studentUser.studentProfile.id;
        const teacherProfileId = teacherUser.teacherProfile.id;

        const existingChatRoom = await prisma.conversation.findFirst({
          where: {
            studentId: studentProfileId,
            teacherId: teacherProfileId,
            subjectId: data.subjectId,
          },
        });

        if (existingChatRoom) {
          socket.emit('chat-details', existingChatRoom);
        } else {
          const newChatRoom = await prisma.conversation.create({
            data: {
              studentId: studentProfileId,
              teacherId: teacherProfileId,
              subjectId: data.subjectId,
            },
          });
          socket.emit('chat-details', newChatRoom);
        }
      } catch (err) {
        console.error('Error handling chat details:', err);
        socket.emit('chat-details-error', { error: 'Failed to load chat details' });
      }
    });

    socket.on('chat-room', async (roomId) => {
      try {
        if (!roomId || typeof roomId !== 'string') return;

        const canJoinConversation = await userIsConversationParticipant(socket.userId, roomId);
        if (canJoinConversation) {
          socket.join(roomId);
          socket.to(roomId).emit('server-joining-message', 'Welcome to the chat room');
          return;
        }

        const canJoinParent = await userIsParentConversationParticipant(socket.userId, roomId);
        if (canJoinParent) {
          socket.join(roomId);
          socket.to(roomId).emit('server-joining-message', 'Welcome to the chat room');
          return;
        }

        const canJoinCommunity = await userIsCommunityMember(socket.userId, roomId);
        if (canJoinCommunity) {
          socket.join(roomId);
          socket.to(roomId).emit('server-joining-message', 'Welcome to the chat room');
          return;
        }

        socket.emit('join-error', { error: 'Not allowed to join this room' });
      } catch (err) {
        console.error('Error joining room:', err);
        socket.emit('join-error', { error: 'Failed to join room' });
      }
    });

    socket.on('send-single-message-to-server', async (data) => {
      try {
        const normalized = normalizeDirectChatMessage(data, socket.userId, socket.userType);
        if (normalized.error) {
          socket.emit('message-error', { error: normalized.error, messageId: data?.messageId });
          return;
        }

        const allowed = await userIsConversationParticipant(socket.userId, normalized.payload.conversationId);
        if (!allowed) {
          socket.emit('message-error', { error: 'Not a participant in this conversation', messageId: normalized.payload.messageId });
          return;
        }

        try {
          await prisma.conversationMessage.create({
            data: toConversationMessageCreate(normalized.payload),
          });
          await prisma.conversation.update({
            where: { id: normalized.payload.conversationId },
            data: { updatedAt: new Date() },
          });
        } catch (saveError) {
          if (saveError.code !== 'P2002') {
            console.error('Error saving message:', saveError);
            socket.emit('message-error', { error: 'Failed to save message', messageId: normalized.payload.messageId });
            return;
          }
        }

        socket.to(normalized.payload.conversationId).emit('server-message', normalized.payload);
        socket.emit('message-ack', { messageId: normalized.payload.messageId, conversationId: normalized.payload.conversationId });
      } catch (err) {
        console.error('Error in send-single-message-to-server:', err);
        socket.emit('message-error', { error: 'Failed to send message', messageId: data?.messageId });
      }
    });

    socket.on('send-parent-message-to-server', async (data) => {
      try {
        if (!data?.conversationId || !data?.text || !data?.messageId) {
          return;
        }

        const allowed = await userIsParentConversationParticipant(socket.userId, data.conversationId);
        if (!allowed) {
          socket.emit('message-error', { error: 'Not a participant in this conversation' });
          return;
        }

        const senderType = socket.userType === 'TEACHER' ? 'TEACHER' : 'PARENT';
        const payload = {
          ...data,
          senderId: socket.userId,
          senderType,
        };

        try {
          await prisma.parentConversationMessage.create({
            data: {
              text: payload.text,
              senderId: socket.userId,
              senderType,
              messageId: payload.messageId,
              conversationId: payload.conversationId,
            },
          });
          await prisma.parentConversation.update({
            where: { id: payload.conversationId },
            data: { updatedAt: new Date() },
          });
        } catch (saveError) {
          if (saveError.code !== 'P2002') {
            console.error('Error saving parent message:', saveError);
          }
        }

        socket.to(payload.conversationId).emit('server-message', payload);
      } catch (err) {
        console.error('Error in send-parent-message-to-server:', err);
      }
    });

    socket.on('send-single-message-to-Community-server', async (data) => {
      try {
        if (!data?.chatName || !data?.text || !data?.messageId) {
          return;
        }

        const allowed = await userIsCommunityMember(socket.userId, data.chatName);
        if (!allowed) {
          socket.emit('community-message-error', {
            message: 'Not a member of this community',
          });
          return;
        }

        const senderUser = await prisma.user.findUnique({
          where: { id: socket.userId },
          include: {
            teacherProfile: { select: { id: true } },
          },
        });

        if (!senderUser?.teacherProfile) {
          socket.emit('community-message-error', {
            message: 'Only teachers can send messages in communities',
          });
          return;
        }

        const payload = {
          ...data,
          senderId: socket.userId,
        };

        try {
          await prisma.communityMessage.create({
            data: {
              text: payload.text,
              messageId: payload.messageId,
              teacherId: senderUser.teacherProfile.id,
              communityId: payload.chatName,
            },
          });
        } catch (saveError) {
          if (saveError.code !== 'P2002') {
            console.error('Error saving community message:', saveError);
          }
        }

        socket.to(payload.chatName).emit('server-message', payload);
      } catch (err) {
        console.error('Error in send-single-message-to-Community-server:', err);
        socket.emit('community-message-error', {
          message: 'Failed to send message. Please try again.',
        });
      }
    });

    socket.on('leave-room', async (data) => {
      if (data?.conversationId && typeof data.conversationId === 'string') {
        socket.leave(data.conversationId);
      }
    });

    socket.on('leave-room-community', async (data) => {
      try {
        if (data?.chatName) {
          socket.leave(data.chatName);
        }

        if (!data?.chatName || !Array.isArray(data.allMessages?.messages)) {
          return;
        }

        const allowed = await userIsCommunityMember(socket.userId, data.chatName);
        if (!allowed) return;

        const senderUser = await prisma.user.findUnique({
          where: { id: socket.userId },
          include: {
            teacherProfile: { select: { id: true } },
          },
        });
        if (!senderUser?.teacherProfile) return;

        const validMessages = data.allMessages.messages.filter((msg) => {
          const senderId = msg.senderId?.userId || msg.senderId;
          return senderId === socket.userId && msg.messageId && msg.text;
        });

        if (validMessages.length === 0) return;

        const existingMessageIds = await prisma.communityMessage.findMany({
          where: {
            messageId: { in: validMessages.map((msg) => msg.messageId) },
            communityId: data.chatName,
          },
          select: { messageId: true },
        });
        const existingSet = new Set(existingMessageIds.map((m) => m.messageId));

        const newMessages = validMessages
          .filter((msg) => !existingSet.has(msg.messageId))
          .map((msg) => ({
            text: msg.text,
            messageId: msg.messageId,
            teacherId: senderUser.teacherProfile.id,
            communityId: data.chatName,
          }));

        if (newMessages.length > 0) {
          await prisma.communityMessage.createMany({
            data: newMessages,
            skipDuplicates: true,
          });
        }
      } catch (err) {
        console.error('Error in leave-room-community:', err);
      }
    });

    socket.on('check-existing-conversation', async (data) => {
      try {
        if (!data?.clientId || !data?.subjectId) {
          socket.emit('conversation-check-error', { error: 'Missing conversation details' });
          return;
        }

        if (data.userId && data.userId !== socket.userId) {
          socket.emit('conversation-check-error', { error: 'Unauthorized' });
          return;
        }

        const studentUser = await prisma.user.findUnique({
          where: { id: socket.userId },
          include: {
            studentProfile: { select: { id: true } },
          },
        });

        if (!studentUser?.studentProfile) {
          socket.emit('conversation-check-error', { error: 'Student profile not found' });
          return;
        }

        const teacherUser = await prisma.user.findUnique({
          where: { id: data.clientId },
          include: {
            teacherProfile: { select: { id: true } },
          },
        });

        if (!teacherUser?.teacherProfile) {
          socket.emit('conversation-check-error', { error: 'Teacher profile not found' });
          return;
        }

        const existingConversation = await prisma.conversation.findFirst({
          where: {
            studentId: studentUser.studentProfile.id,
            teacherId: teacherUser.teacherProfile.id,
            subjectId: data.subjectId,
          },
        });

        if (existingConversation) {
          socket.emit('conversation-exists', existingConversation);
        } else {
          socket.emit('no-conversation-found');
        }
      } catch (err) {
        console.error('Error checking for existing conversation:', err);
        socket.emit('conversation-check-error', { error: 'Failed to check conversation' });
      }
    });

    socket.on('disconnect', () => {
      count--;
      console.log('socket disconnected', socket.id, 'online', count);
    });
  });

  return io;
};
