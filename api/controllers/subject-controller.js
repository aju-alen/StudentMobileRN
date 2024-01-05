import User from "../models/user.js";
import dotenv from "dotenv";
import Subject from "../models/subjects.js";
dotenv.config();

export const createSubject = async (req, res,next) => {
    const { subjectName, subjectDescription, subjectImage, subjectPrice, subjectBoard, subjectGrade } = req.body;

    if (!subjectName || !subjectDescription || !subjectImage || !subjectPrice || !subjectBoard || !subjectGrade) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try{
        if( req.isTeacher === true ){

            const newSubject = new Subject({
                ...req.body,
                user: req.userId
            });
            const savedSubject = await newSubject.save();
            const updateUser = await User.findById(req.userId);
            updateUser.subjects.push(savedSubject._id);
            await updateUser.save();
    
    
    
            res.status(202).json({ message: "Subject Created", savedSubject });
        }
        else{
            res.status(400).json({ message: "Only teachers can create subjects" });
        }

        
    }
    catch(err){
        console.log(err,'Error in createSubject api');
        next(err);
    }
}

export const getAllSubjects = async (req, res,next) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}
export const getOneSubject = async (req, res,next) => {
    try {
        const subject = await Subject.findById(req.params.subjectId).populate('user');
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        res.status(200).json(subject);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}