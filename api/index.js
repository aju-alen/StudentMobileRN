import express from 'express';
import bodyParser from 'body-parser';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import conversationRoute from './routes/conversation-route.js';
import reviewRoutes from "./routes/review-routes.js";
import messageRoute from './routes/message.route.js';
import communityRoute from './routes/community-route.js'
import stripeOnboardRoute from './routes/stripeOnboard-route.js'
import bookingRoutes from './routes/bookingRoutes.js';
import zoomRoutes from './routes/zoomRoutes.js';
import reportRoutes from './routes/report-routes.js';
import stripeRoutes from './routes/stripe-route.js';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import cors from 'cors';
import { createServer } from 'http';
import s3route from './routes/s3route.js';
import { initializeSocket } from './socket/socketHandler.js';
import { stripeWebhook } from './controllers/stripe-controller.js';

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
        "https://coachacadem-webapp.onrender.com",
        "https://coachacadem.ae/",
        "exp://", // Allow all Expo URLs
        "https://*.expo.dev", // Allow Expo development URLs
        "https://*.render.com", // Allow Render URLs
        process.env.FRONTEND_URL, // Allow your production frontend URL
        "*" // Allow all origins in development
    ].filter(Boolean), // Remove any undefined values
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/stripe-webhook', express.raw({type: 'application/json'}), stripeWebhook);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/health', (req, res) => {
    res.status(200).json({ message: "Server is healthy" });
}
);
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
app.use('/api/reports', reportRoutes);
app.use('/api/stripe', stripeRoutes);
app.use(errorHandler)

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
