import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import conversationRoute from './routes/conversation-route.js';
import reviewRoutes from "./routes/review-routes.js";
import messageRoute from './routes/message.route.js';
import communityRoute from './routes/community-route.js'
import stripeOnboardRoute from './routes/stripeOnboard-route.js'
import bookingRoutes from './routes/bookingRoutes.js';
import zoomRoutes from './routes/zoomRoutes.js';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import cors from 'cors';
import { createServer } from 'http';
import s3route from './routes/s3route.js';
import { initializeSocket } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

app.use(cors({
    origin: [
        "http://localhost:5173",
        "exp://192.168.0.174:8081",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://192.168.0.174:19006",
    ],
})); //frontend url
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.use('/api/conversation', conversationRoute)
app.use('/api/s3', s3route)
app.use('/api/message', messageRoute)
app.use('/api/community', communityRoute)
app.use('/api/stripe-onboard',stripeOnboardRoute)
app.use('/api/bookings', bookingRoutes); 
app.use('/api/zoom', zoomRoutes);
app.use("/api/reviews", reviewRoutes); 

app.use(errorHandler)

const port = process.env.PORT || 3000;
server.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
