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
import courseEnrollmentRoutes from './routes/course-enrollment-routes.js';
import parentRoute from './routes/parent-route.js';
import studentParentRoute from './routes/student-parent-route.js';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import s3route from './routes/s3route.js';
import { initializeSocket } from './socket/socketHandler.js';
import { stripeWebhook } from './controllers/stripe-controller.js';
import { zoomWebhook } from './controllers/zoomController.js';
import { globalApiLimiter } from './middlewares/rateLimit.js';
import { startClassReminderJob } from './services/classReminderService.js';

dotenv.config();

const app = express();
const server = createServer(app);

const allowedOrigins = [
  'https://coachacadem.ae',
  'https://www.coachacadem.ae',
  'https://coachacadem-webapp.onrender.com',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (React Native, curl, server-to-server) with no Origin
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Initialize Socket.IO
const io = initializeSocket(server, allowedOrigins);

app.use(helmet());
app.use(cors(corsOptions));
app.use('/api/stripe-webhook', express.raw({type: 'application/json'}), stripeWebhook);
app.post('/api/zoom/webhook', express.raw({ type: 'application/json' }), zoomWebhook);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(globalApiLimiter);
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
app.use('/api/enrollments', courseEnrollmentRoutes);
app.use('/api/parent', parentRoute);
app.use('/api/student', studentParentRoute);
app.use(errorHandler)
app.get('/health', (req, res) => {
    res.status(200).json({ message: "Server is healthy" });
}
);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startClassReminderJob();
})
