
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import paymentRoute from './routes/payment-route.js';
import conversationRoute from './routes/conversation-route.js';
import messageRoute from './routes/message.route.js';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Conversation from './models/conversation.js';
import { log } from 'console';

dotenv.config();

const app = express();
const server = createServer(app);

const socketIO = new Server(server, {
    cors: {
        origin: "http://localhost:8081",
    }
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let count = 0;
socketIO.on("connection", (socket) => {
    count++;
    console.log(" id is ", socket.id);
    console.log("Number of users online", count);

    socket.on("send-chat-details", async (data) => { // user client and subject data sent from client 
        console.log('recieved the chat details on the client side', data);
        const existingChatRoom = await Conversation.findOne({
            $or: [
                { userId: data.userId, clientId: data.clientId, subjectId: data.subjectId },
                { userId: data.clientId, clientId: data.userId, subjectId: data.subjectId }
            ]
        });
        if (existingChatRoom) {
            console.log('existing chat room', existingChatRoom);
            socket.emit("chat-details", existingChatRoom); // send the conversation object from db  to the client
        }
        else {
            const newChatRoom = new Conversation({
                userId: data.userId,
                clientId: data.clientId,
                subjectId: data.subjectId
            });
            const savedChatRoom = await newChatRoom.save();
            console.log('new chat room', savedChatRoom);
            socket.emit("chat-details", savedChatRoom); // send the new conversation object to the client
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
    socket.on('leave-room',async (data)=>{
        console.log('leaving room',data);
        

        socket.leave(data.conversationId);
        
        let conversation = await Conversation.findById(data.conversationId);
        log(conversation,'this is mongoDb conversation object');
        log(conversation.messages,'this is mongoDb conversation message');
        log(data.allMessages.messages,'this is message from client');

        conversation.messages = data.allMessages.messages;
        await conversation.save();
        

        // socket.to("room 237").emit(`user ${socket.id} has left the room`);
    })



    socket.on("disconnect", () => {
        count--;
        console.log("Client disconnected and number of users online are ", count);
    });

})


const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
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
app.use('/api/message', messageRoute)


app.use(errorHandler)

const port = process.env.PORT || 3000;
server.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
