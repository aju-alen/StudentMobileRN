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
        
                // Check for an existing chat room
                const existingChatRoom = await prisma.conversation.findFirst({
                    where: {
                        OR: [
                            {
                                userId: data.userId,
                                clientId: data.clientId,
                                subjectId: data.subjectId,
                            },
                            {
                                userId: data.clientId,
                                clientId: data.userId,
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
                            userId: data.userId,
                            clientId: data.clientId,
                            subjectId: data.subjectId,
                        },
                    });
        
                    console.log('New chat room', newChatRoom);
                    // Send the new conversation object to the client
                    socket.emit("chat-details", newChatRoom);
                }
            } catch (err) {
                console.error('Error handling chat details:', err);
            }
        });

        socket.on("chat-room", (data) => {
            console.log('received the chat room details on the server side', data);
            socket.join(data);
            socket.to(data).emit('server-joining-message', 'Welcome to the chat room');
        });

        socket.on("send-single-message-to-server", (data) => {
            console.log(data, 'this is message seen in server after hitting send');
            socket.to(data.conversationId).emit('server-message', data);
        });

        socket.on("send-single-message-to-Community-server", (data) => {
            console.log(data, 'this is message seen in server after hitting send');
            socket.to(data.chatName).emit('server-message', data);
        });

        socket.on('leave-room', async (data) => {
            console.log('leaving room', data);
        
            // User leaves the room
            socket.leave(data.conversationId);
        
            try {
                // Fetch the conversation from the database using Prisma
                const conversation = await prisma.conversation.findUnique({
                    where: {
                        id: data.conversationId,
                    },
                    include: {
                        messages: true, // Include all related messages
                    },
                });
        
                if (!conversation) {
                    console.error(`Conversation with ID ${data.conversationId} not found.`);
                    return;
                }
        
                console.log(conversation, 'this is Prisma conversation object');
                console.log(conversation.messages, 'this is Prisma conversation messages');
                console.log(data, 'this is client object data');
                console.log(data.allMessages.messages, 'this is message from client');
        
                // Update messages if provided by the client
                if (data.allMessages.messages !== undefined) {
                    for (const msg of data.allMessages.messages) {
                        // Check if message ID exists or handle it as a new message
                        if (msg.id) {
                            // Update or create message
                            await prisma.conversationMessage.upsert({
                                where: {
                                    id: msg.id, // Unique identifier for existing messages
                                },
                                update: {
                                    text: msg.text,
                                    senderId: msg.senderId,
                                    messageId: msg.messageId,
                                },
                                create: {
                                    text: msg.text,
                                    senderId: msg.senderId,
                                    messageId: msg.messageId,
                                    conversationId: data.conversationId,
                                },
                            });
                        } else {
                            // Create a new message if no ID is provided
                            await prisma.conversationMessage.create({
                                data: {
                                    text: msg.text,
                                    senderId: msg.senderId,
                                    messageId: msg.messageId,
                                    conversationId: data.conversationId,
                                },
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Error handling leave-room event:', err);
            }
        });
        
        socket.on('leave-room-community', async (data) => {
            try {
                console.log('leaving room', data);
        
                // Leave the chat room
                socket.leave(data.chatName);
        
                // Find the community by ID (chatName represents communityId here)
                let community = await prisma.community.findUnique({
                    where: { id: data.chatName },
                    include: {
                        messages: true, // Fetch existing messages
                    },
                });
        
                console.log(community, 'this is the Prisma Community object');
                console.log(community?.messages, 'this is the Prisma Community messages');
                console.log(data, 'this is the client object data');
                console.log(data.allMessages.messages, 'this is messages from client');
        
                // If client provided updated messages, update the community messages
                if (data.allMessages.messages !== undefined) {
                    // Delete existing messages
                    await prisma.communityMessage.deleteMany({
                        where: { communityId: data.chatName },
                    });
        
                    // Create new messages from the client
                    const newMessages = data.allMessages.messages.map((message) => ({
                        text: message.text,
                        messageId: message.messageId,
                        senderId: message.senderId,
                        communityId: data.chatName,
                    }));
        
                    await prisma.communityMessage.createMany({
                        data: newMessages,
                    });
                }
        
                console.log('Community messages updated successfully');
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
                
                // Check for an existing conversation
                const existingConversation = await prisma.conversation.findFirst({
                    where: {
                        OR: [
                            {
                                userId: userId,
                                clientId: clientId,
                                subjectId: subjectId,
                            },
                            {
                                userId: clientId,
                                clientId: userId,
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