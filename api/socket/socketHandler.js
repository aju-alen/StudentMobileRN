import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let count = 0;

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                "exp://192.168.0.174:8081",
                "http://localhost:8081",
                "http://localhost:19000",
                "http://192.168.0.174:19006",
            ],
        }
    });

    io.on("connection", (socket) => {
        count++;
        console.log(" id is ", socket.id);
        console.log("Number of users online", count);

        socket.on("send-chat-details", async (data) => {
            try {
                console.log('Received the chat details on the client side', data);
        
                // Get StudentProfile.id from userId (student)
                const studentUser = await prisma.user.findUnique({
                    where: { id: data.userId },
                    include: {
                        studentProfile: {
                            select: { id: true }
                        }
                    }
                });

                if (!studentUser || !studentUser.studentProfile) {
                    socket.emit("chat-details-error", { error: "Student profile not found" });
                    return;
                }

                // Get TeacherProfile.id from clientId (teacher)
                const teacherUser = await prisma.user.findUnique({
                    where: { id: data.clientId },
                    include: {
                        teacherProfile: {
                            select: { id: true }
                        }
                    }
                });

                if (!teacherUser || !teacherUser.teacherProfile) {
                    socket.emit("chat-details-error", { error: "Teacher profile not found" });
                    return;
                }

                const studentProfileId = studentUser.studentProfile.id;
                const teacherProfileId = teacherUser.teacherProfile.id;
        
                // Check for an existing chat room
                const existingChatRoom = await prisma.conversation.findFirst({
                    where: {
                        OR: [
                            {
                                studentId: studentProfileId,
                                teacherId: teacherProfileId,
                                subjectId: data.subjectId,
                            },
                            {
                                studentId: teacherProfileId,
                                teacherId: studentProfileId,
                                subjectId: data.subjectId,
                            },
                        ],
                    },
                });
        
                if (existingChatRoom) {
                    console.log('Existing chat room', existingChatRoom);
                    // Send the existing conversation object to the client
                    socket.emit("chat-details", existingChatRoom);
                } else {
                    // Create a new chat room
                    const newChatRoom = await prisma.conversation.create({
                        data: {
                            studentId: studentProfileId,
                            teacherId: teacherProfileId,
                            subjectId: data.subjectId,
                        },
                    });
        
                    console.log('New chat room', newChatRoom);
                    // Send the new conversation object to the client
                    socket.emit("chat-details", newChatRoom);
                }
            } catch (err) {
                console.error('Error handling chat details:', err);
                socket.emit("chat-details-error", { error: err.message });
            }
        });

        socket.on("chat-room", (data) => {
            console.log('received the chat room details on the server side', data);
            socket.join(data);
            socket.to(data).emit('server-joining-message', 'Welcome to the chat room');
        });

        socket.on("send-single-message-to-server", async (data) => {
            try {
                console.log(data, 'this is message seen in server after hitting send');
                
                // Get user type to determine senderType
                const senderUser = await prisma.user.findUnique({
                    where: { id: data.senderId },
                    select: { userType: true }
                });

                if (!senderUser) {
                    console.error(`User not found: ${data.senderId}`);
                    // Still broadcast even if user not found
                    socket.to(data.conversationId).emit('server-message', data);
                    return;
                }

                const senderType = senderUser.userType === 'TEACHER' ? 'TEACHER' : 'STUDENT';

                // Save message immediately to database
                try {
                    await prisma.conversationMessage.create({
                        data: {
                            text: data.text,
                            senderId: data.senderId,
                            senderType: senderType,
                            messageId: data.messageId,
                            conversationId: data.conversationId,
                        },
                    });
                } catch (saveError) {
                    // If message already exists (duplicate messageId), skip
                    if (saveError.code === 'P2002') {
                        console.log('Message already exists, skipping save');
                    } else {
                        console.error('Error saving message:', saveError);
                    }
                }

                // Broadcast message to other users in the room
                socket.to(data.conversationId).emit('server-message', data);
            } catch (err) {
                console.error('Error in send-single-message-to-server:', err);
                // Still broadcast even if save fails
                socket.to(data.conversationId).emit('server-message', data);
            }
        });

        socket.on("send-single-message-to-Community-server", async (data) => {
            try {
                console.log(data, 'this is message seen in server after hitting send');
                
                // Get user with teacher profile - only teachers can send messages
                const senderUser = await prisma.user.findUnique({
                    where: { id: data.senderId },
                    include: {
                        teacherProfile: {
                            select: { id: true }
                        }
                    }
                });

                if (!senderUser || !senderUser.teacherProfile) {
                    console.error(`Teacher profile not found for senderId: ${data.senderId}. Only teachers can send messages.`);
                    // Emit error to sender only
                    socket.emit('community-message-error', { 
                        message: 'Only teachers can send messages in communities' 
                    });
                    return;
                }

                const teacherProfileId = senderUser.teacherProfile.id;

                // Save message immediately to database
                try {
                    await prisma.communityMessage.create({
                        data: {
                            text: data.text,
                            messageId: data.messageId,
                            teacherId: teacherProfileId,
                            communityId: data.chatName,
                        },
                    });
                } catch (saveError) {
                    // If message already exists (duplicate messageId), skip
                    if (saveError.code === 'P2002') {
                        console.log('Message already exists, skipping save');
                    } else {
                        console.error('Error saving community message:', saveError);
                    }
                }

                // Broadcast message to other users in the room
                socket.to(data.chatName).emit('server-message', data);
            } catch (err) {
                console.error('Error in send-single-message-to-Community-server:', err);
                // Emit error to sender only
                socket.emit('community-message-error', { 
                    message: 'Failed to send message. Please try again.' 
                });
            }
        });

        socket.on('leave-room', async (data) => {
            console.log('leaving room', data);
        
            // User leaves the room
            socket.leave(data.conversationId);
        
            try {
                // Validate input
                if (!data.allMessages?.messages || !Array.isArray(data.allMessages.messages) || data.allMessages.messages.length === 0) {
                    return; // No messages to save
                }

                // Filter valid messages
                const validMessages = data.allMessages.messages.filter(
                    msg => msg.senderId && msg.messageId && msg.text
                );

                if (validMessages.length === 0) {
                    return;
                }

                // Get all unique senderIds
                const uniqueSenderIds = [...new Set(validMessages.map(msg => msg.senderId))];
                
                // Batch fetch all user types in one query
                const users = await prisma.user.findMany({
                    where: { id: { in: uniqueSenderIds } },
                    select: { id: true, userType: true }
                });

                // Create a map for O(1) lookup
                const userTypeMap = new Map(
                    users.map(u => [u.id, u.userType === 'TEACHER' ? 'TEACHER' : 'STUDENT'])
                );

                // Get all existing messageIds in one query
                const existingMessageIds = await prisma.conversationMessage.findMany({
                    where: {
                        messageId: { in: validMessages.map(msg => msg.messageId) },
                        conversationId: data.conversationId,
                    },
                    select: { messageId: true, id: true }
                });

                const existingMessageIdSet = new Set(existingMessageIds.map(m => m.messageId));
                const existingMessageIdMap = new Map(
                    existingMessageIds.map(m => [m.messageId, m.id])
                );

                // Separate new and existing messages
                const newMessages = [];
                const updateMessages = [];

                for (const msg of validMessages) {
                    const senderType = userTypeMap.get(msg.senderId);
                    
                    if (!senderType) {
                        console.warn(`User type not found for senderId: ${msg.senderId}`);
                        continue;
                    }

                    if (existingMessageIdSet.has(msg.messageId)) {
                        // Message exists, prepare for update
                        updateMessages.push({
                            id: existingMessageIdMap.get(msg.messageId),
                            text: msg.text,
                            senderId: msg.senderId,
                            senderType: senderType,
                            messageId: msg.messageId,
                        });
                    } else {
                        // New message, prepare for create
                        newMessages.push({
                            text: msg.text,
                            senderId: msg.senderId,
                            senderType: senderType,
                            messageId: msg.messageId,
                            conversationId: data.conversationId,
                        });
                    }
                }

                // Use transaction for atomicity
                await prisma.$transaction(async (tx) => {
                    // Bulk create new messages
                    if (newMessages.length > 0) {
                        await tx.conversationMessage.createMany({
                            data: newMessages,
                            skipDuplicates: true, // Skip if messageId already exists
                        });
                    }

                    // Bulk update existing messages
                    if (updateMessages.length > 0) {
                        await Promise.all(
                            updateMessages.map(msg =>
                                tx.conversationMessage.update({
                                    where: { id: msg.id },
                                    data: {
                                        text: msg.text,
                                        senderId: msg.senderId,
                                        senderType: msg.senderType,
                                        messageId: msg.messageId,
                                    },
                                })
                            )
                        );
                    }
                });

                console.log(`Saved ${newMessages.length} new messages and updated ${updateMessages.length} existing messages`);
            } catch (err) {
                console.error('Error handling leave-room event:', err);
            }
        });
        
        socket.on('leave-room-community', async (data) => {
            try {
                console.log('leaving room', data);
        
                // Leave the chat room
                socket.leave(data.chatName);
        
                // Validate input
                if (!data.allMessages?.messages || !Array.isArray(data.allMessages.messages) || data.allMessages.messages.length === 0) {
                    return; // No messages to save
                }

                // Filter valid messages - handle both direct senderId and senderId.userId
                // Only save messages from teachers
                const validMessages = data.allMessages.messages.filter(
                    msg => {
                        const senderId = msg.senderId?.userId || msg.senderId;
                        return senderId && msg.messageId && msg.text;
                    }
                );

                if (validMessages.length === 0) {
                    return;
                }

                // Get all unique sender User IDs
                const uniqueSenderUserIds = [...new Set(validMessages.map(msg => {
                    return msg.senderId?.userId || msg.senderId;
                }))];
                
                // Batch fetch teacher profiles only - only teachers can send messages
                const users = await prisma.user.findMany({
                    where: { id: { in: uniqueSenderUserIds } },
                    include: {
                        teacherProfile: {
                            select: { id: true }
                        }
                    }
                });

                // Create map for O(1) lookup: User.id -> TeacherProfile.id
                const teacherProfileMap = new Map();
                users.forEach(u => {
                    if (u.teacherProfile) {
                        teacherProfileMap.set(u.id, u.teacherProfile.id);
                    }
                });

                // Get all existing messageIds in one query
                const existingMessageIds = await prisma.communityMessage.findMany({
                    where: {
                        messageId: { in: validMessages.map(msg => msg.messageId) },
                        communityId: data.chatName,
                    },
                    select: { messageId: true, id: true }
                });

                const existingMessageIdSet = new Set(existingMessageIds.map(m => m.messageId));

                // Separate new and existing messages (only from teachers)
                const newMessages = [];

                for (const msg of validMessages) {
                    const senderUserId = msg.senderId?.userId || msg.senderId;
                    const teacherProfileId = teacherProfileMap.get(senderUserId);
                    
                    // Skip if not a teacher (only teachers can send messages)
                    if (!teacherProfileId) {
                        console.warn(`Teacher profile not found for senderId: ${senderUserId}. Skipping message.`);
                        continue;
                    }

                    if (!existingMessageIdSet.has(msg.messageId)) {
                        // New message, prepare for create
                        newMessages.push({
                            text: msg.text,
                            messageId: msg.messageId,
                            teacherId: teacherProfileId,
                            communityId: data.chatName,
                        });
                    }
                    // Existing messages are already saved, skip
                }

                // Use transaction for atomicity
                if (newMessages.length > 0) {
                    await prisma.$transaction(async (tx) => {
                        await tx.communityMessage.createMany({
                            data: newMessages,
                            skipDuplicates: true,
                        });
                    });
                }

                console.log(`Saved ${newMessages.length} new community messages`);
            } catch (err) {
                console.error('Error in leave-room-community:', err);
            }
        });

        socket.on("disconnect", () => {
            count--;
            console.log("Client disconnected and number of users online are ", count);
        });

        // Add new event for checking existing conversations
        socket.on("check-existing-conversation", async (data) => {
            try {
                const { userId, clientId, subjectId } = data;
                
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
                    socket.emit("conversation-check-error", { error: "Student profile not found" });
                    return;
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
                    socket.emit("conversation-check-error", { error: "Teacher profile not found" });
                    return;
                }

                const studentProfileId = studentUser.studentProfile.id;
                const teacherProfileId = teacherUser.teacherProfile.id;
                
                // Check for an existing conversation
                const existingConversation = await prisma.conversation.findFirst({
                    where: {
                        OR: [
                            {
                                studentId: studentProfileId,
                                teacherId: teacherProfileId,
                                subjectId: subjectId,
                            },
                            {
                                studentId: teacherProfileId,
                                teacherId: studentProfileId,
                                subjectId: subjectId,
                            },
                        ],
                    },
                });

                if (existingConversation) {
                    console.log('Found existing conversation:', existingConversation);
                    socket.emit("conversation-exists", existingConversation);
                } else {
                    console.log('No existing conversation found');
                    socket.emit("no-conversation-found");
                }
            } catch (err) {
                console.error('Error checking for existing conversation:', err);
                socket.emit("conversation-check-error", { error: err.message });
            }
        });
    });

    return io;
}; 