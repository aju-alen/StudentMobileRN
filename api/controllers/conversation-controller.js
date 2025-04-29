import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

export const getAllConversations = async (req, res, next) => {
    console.log('req.params', req.params);
    console.log('inside conversation controller API');

    try {
        const userId = req.params.userId;

        // Fetch conversations where the user is either userId or clientId
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { clientId: userId },
                ],
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true,
                    },
                },
                client: {
                    select: {
                        name: true,
                        profileImage: true,
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

        if (!conversations || conversations.length === 0) {
            return res.status(400).json({ message: 'No conversations found' });
        }

        return res.status(200).json(conversations);
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
                id: req.params.conversationId, // Ensure the conversationId exists in the request params
            },
            include: {
                client: {
                    select: {
                        name: true,
                        profileImage: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        profileImage: true,
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

        // Return the conversation
        return res.status(200).json(conversation);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
export const createConversation = async (req, res, next) => {
    try {
        const { userId, clientId, subjectId } = req.body;
        const conversation = await prisma.conversation.create({
            data: { userId, clientId, subjectId },
        });
        res.status(201).json(conversation);
    } catch (err) {
        console.error(err);
        next(err);
    }
}
    
