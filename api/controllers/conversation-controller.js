import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

const MESSAGE_SELECT = {
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
};

const LAST_MESSAGES_LIMIT = 100;

const isConversationParticipant = (conversation, userId) => {
    return Boolean(
        conversation &&
        (conversation.student?.userId === userId || conversation.teacher?.userId === userId)
    );
};

export const getAllConversations = async (req, res, next) => {

    try {
        const userId = req.userId;

        // Get user's profile IDs (could be student or teacher)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: { select: { id: true } },
                teacherProfile: { select: { id: true } }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const studentProfileId = user.studentProfile?.id;
        const teacherProfileId = user.teacherProfile?.id;

        // Build OR condition for conversations
        const orConditions = [];
        if (studentProfileId) {
            orConditions.push({ studentId: studentProfileId });
        }
        if (teacherProfileId) {
            orConditions.push({ teacherId: teacherProfileId });
        }

        if (orConditions.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch conversations where the user is either student or teacher
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: orConditions,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                teacher: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                subject: {
                    select: {
                        subjectName: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: MESSAGE_SELECT,
                },
            },
        });

        const transformedConversations = conversations.map(conv => ({
            ...conv,
            user: conv.student.user,
            client: conv.teacher.user,
            lastMessage: conv.messages?.[0] || null,
        }));

        if (!transformedConversations || transformedConversations.length === 0) {
            console.log('No conversations found');
            res.status(204).json({ message: 'No conversations found' });
            return;
        }

        return res.status(200).json(transformedConversations);
    } catch (err) {
        console.error(err);
        next(err);
    }
};
export const getSingleConversation = async (req, res, next) => {
    console.log('req.params for single convo', req.params);

    try {
        // Find the conversation by its ID
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: req.params.conversationId,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                teacher: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: LAST_MESSAGES_LIMIT,
                    select: MESSAGE_SELECT,
                },
            },
        });

        // If the conversation does not exist
        if (!conversation) {
            return res.status(400).json({ message: "No conversation found" });
        }

        if (!isConversationParticipant(conversation, req.userId)) {
            return res.status(403).json({ message: "You are not allowed to perform this action" });
        }

        // Transform response to match expected format
        const response = {
            ...conversation,
            user: conversation.student.user,
            client: conversation.teacher.user,
            messages: [...(conversation.messages || [])].reverse(),
        };

        // Return the conversation
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
export const createConversation = async (req, res, next) => {
    try {
        const { userId, clientId, subjectId } = req.body;
        let studentUserId;
        let teacherUserId;

        if (req.userType === 'STUDENT') {
            studentUserId = req.userId;
            teacherUserId = clientId;
        } else if (req.userType === 'TEACHER') {
            teacherUserId = req.userId;
            studentUserId = userId;
        } else {
            return res.status(403).json({ message: "You are not allowed to perform this action" });
        }

        // Get StudentProfile.id from authenticated student
        const studentUser = await prisma.user.findUnique({
            where: { id: studentUserId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!studentUser || !studentUser.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        // Get TeacherProfile.id from authenticated teacher or requested teacher
        const teacherUser = await prisma.user.findUnique({
            where: { id: teacherUserId },
            include: {
                teacherProfile: {
                    select: { id: true }
                }
            }
        });

        if (!teacherUser || !teacherUser.teacherProfile) {
            return res.status(400).json({ message: "Teacher profile not found" });
        }

        const conversation = await prisma.conversation.create({
            data: {
                studentId: studentUser.studentProfile.id,
                teacherId: teacherUser.teacherProfile.id,
                subjectId,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
                teacher: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
        });

        // Transform response to match expected format
        const response = {
            ...conversation,
            user: conversation.student.user,
            client: conversation.teacher.user,
        };

        res.status(201).json(response);
    } catch (err) {
        console.error(err);
        next(err);
    }
}
    
