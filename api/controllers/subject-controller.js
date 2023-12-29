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
    catch(err){
        console.log(err,'Error in createSubject api');
        next(err);
    }
}
