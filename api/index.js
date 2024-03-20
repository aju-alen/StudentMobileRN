
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

dotenv.config();

const app = express();
const server = createServer(app);

const socketIO = new Server(server, {
    cors: {
        origin: "http://localhost:8081",
    }
});

app.use(cors({
    origin: [
        "exp://10.65.1.122:8081",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://10.65.1.122:19006",
    ],
})); //frontend url
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

    socket.on("send-single-message-to-Community-server",(data) =>{
        console.log(data, 'this is message seen in server after hitting send');
        socket.to(data.chatName).emit('server-message', data);        
    }
    )
    socket.on('leave-room',async (data)=>{
        console.log('leaving room',data);
        

        socket.leave(data.conversationId);
        
        let conversation = await Conversation.findById(data.conversationId);
        log(conversation,'this is mongoDb conversation object');
        log(conversation.messages,'this is mongoDb conversation message');
        log(data,'this is client object data');

        log(data.allMessages.messages,'this is message from client');
        if(data.allMessages.messages !== undefined){
            conversation.messages = data.allMessages.messages;
        }
        await conversation.save();
    })
    socket.on('leave-room-community',async (data)=>{
        console.log('leaving room',data);
        

        socket.leave(data.chatName);
        
        let community = await Community.findById(data.chatName);
        log(community,'this is mongoDb Community object');
        log(community.messages,'this is mongoDb Community message');
        log(data,'this is client object data');

        log(data.allMessages.messages,'this is message from client');
        if(data.allMessages.messages !== undefined){
            community.messages = data.allMessages.messages;
        }
        await community.save();
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
app.use('/api/community', communityRoute)


app.use(errorHandler)

const port = process.env.PORT || 3000;
server.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
