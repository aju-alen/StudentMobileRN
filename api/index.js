
import  express  from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoute from './routes/auth-route.js';
import subjectRoute from './routes/subject-routes.js';
import dotenv from 'dotenv';
import {errorHandler} from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

import cors from 'cors';
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


app.use(errorHandler)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
})
