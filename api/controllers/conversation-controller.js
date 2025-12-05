import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

export const getAllConversations = async (req, res, next) => {

    try {
        const userId = req.params.userId;

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
                    select: {
                        id: true,
                        senderId: true,
                        text: true,
                        messageId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        // Transform response to match expected format
        const transformedConversations = conversations.map(conv => ({
            ...conv,
            user: conv.student.user,
            client: conv.teacher.user,
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
                    select: {
                        id: true,
                        senderId: true,
                        text: true,
                        messageId: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
            },
        });

        // If the conversation does not exist
        if (!conversation) {
            return res.status(400).json({ message: "No conversation found" });
        }

        // Transform response to match expected format
        const response = {
            ...conversation,
            user: conversation.student.user,
            client: conversation.teacher.user,
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

        // Get StudentProfile.id from userId (student)
        const studentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!studentUser || !studentUser.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        // Get TeacherProfile.id from clientId (teacher)
        const teacherUser = await prisma.user.findUnique({
            where: { id: clientId },
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
    
