import User from "../models/user.js";
import dotenv from "dotenv";
import Subject from "../models/subjects.js";
dotenv.config();

export const getAllSubjectsfalse = async (req, res,next) => {
    try {
        
        const subjects = await Subject.find({subjectVerification:false});
        res.status(200).json(subjects);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}
