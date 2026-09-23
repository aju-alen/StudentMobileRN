import dotenv from "dotenv";
import crypto from "crypto";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const assertConversationParticipant = async (req, res) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: req.params.conversationId },
        select: {
            student: { select: { userId: true } },
            teacher: { select: { userId: true } },
        },
    });

    if (!conversation) {
        res.status(400).json({ message: "No conversation found" });
        return false;
    }

    const isParticipant =
        conversation.student?.userId === req.userId ||
        conversation.teacher?.userId === req.userId;

    if (!isParticipant) {
        res.status(403).json({ message: "You are not allowed to perform this action" });
        return false;
    }

    return true;
};

export const getMessages = async (req, res, next) => {
  try {
    const allowed = await assertConversationParticipant(req, res);
    if (!allowed) return;

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const before = req.query.before;

    const messages = await prisma.conversationMessage.findMany({
      where: {
        conversationId: req.params.conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        senderId: true,
        senderType: true,
        type: true,
        text: true,
        messageId: true,
        mediaUrl: true,
        mediaMime: true,
        durationMs: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(messages.reverse());
  } catch (err) {
    next(err);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const allowed = await assertConversationParticipant(req, res);
    if (!allowed) return;

    const text = req.body?.text ?? req.body?.message;
    if (!text || (typeof text === 'string' && !text.trim())) {
      return res.status(400).json({ message: "Please provide a message" });
    }

    const senderType = req.userType === 'TEACHER' ? 'TEACHER' : 'STUDENT';
    const message = await prisma.conversationMessage.create({
      data: {
        senderId: req.userId,
        senderType,
        text: String(text).trim(),
        messageId: req.body?.messageId || crypto.randomUUID(),
        conversationId: req.params.conversationId,
      },
    });
    return res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

export const openConversation = async (req, res, next) => {
  try {
    const allowed = await assertConversationParticipant(req, res);
    if (!allowed) return;

    const senderType = req.userType === 'TEACHER' ? 'TEACHER' : 'STUDENT';
    const message = await prisma.conversationMessage.create({
      data: {
        senderId: req.userId,
        senderType,
        text: "Hello",
        messageId: crypto.randomUUID(),
        conversationId: req.params.conversationId,
      },
    });
    return res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};
