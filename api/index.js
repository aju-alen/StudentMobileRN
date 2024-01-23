
import  express  from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import paymentRoute from './routes/payment-route.js';
import conversationRoute from './routes/conversation-route.js';
import messageRoute from './routes/message.route.js';
import dotenv from 'dotenv';
import {errorHandler} from './middlewares/errorHandler.js';
import cors from 'cors';
dotenv.config();

const app = express();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

const connect = async () => {
    try{

        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to database");
    }
    catch(err){
        console.log(err);
    }

}

app.use('/api/auth',authRoute)
app.use('/api/subjects',subjectRoute)
app.use('/api/payments',paymentRoute)
app.use('/api/conversation',conversationRoute)
app.use('/api/message',messageRoute)


app.use(errorHandler)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
