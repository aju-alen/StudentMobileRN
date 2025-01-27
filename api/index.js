
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import paymentRoute from './routes/payment-route.js';
import conversationRoute from './routes/conversation-route.js';
import messageRoute from './routes/message.route.js';
import communityRoute from './routes/community-route.js'
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Conversation from './models/conversation.js';
import { log } from 'console';
import Community from './models/community.js';
import s3route from './routes/s3route.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

const app = express();
const server = createServer(app);

const socketIO = new Server(server, {
    cors: {
        origin: [
            "exp://192.168.0.174:8081",
            "http://localhost:8081",
            "http://localhost:19000",
            "http://192.168.0.174:19006",
        ],
    }
});

app.use(cors({
    origin: [
        "exp://192.168.0.174:8081",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://192.168.0.174:19006",
    ],
})); //frontend url
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let count = 0;
socketIO.on("connection", (socket) => {
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
        console.log('recieved the chat room details on the server side', data);
        socket.join(data);
        socket.to(data).emit('server-joining-message', 'Welcome to the chat room');

    })
    socket.on("send-single-message-to-server", (data) => {
        console.log(data, 'this is message seen in server after hitting send');

        socket.to(data.conversationId).emit('server-message', data);
    }) // message sent from client

    socket.on("send-single-message-to-Community-server", (data) => {
        console.log(data, 'this is message seen in server after hitting send');
        socket.to(data.chatName).emit('server-message', data);
    }
    )
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

})


const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to database");
    }
    catch (err) {
        console.log(err);
    }
}

app.use('/api/auth', authRoute)
app.use('/api/subjects', subjectRoute)
app.use('/api/payments', paymentRoute)
app.use('/api/conversation', conversationRoute)
app.use('/api/s3', s3route)
app.use('/api/message', messageRoute)
app.use('/api/community', communityRoute)


app.use(errorHandler)

const port = process.env.PORT || 3000;
server.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
