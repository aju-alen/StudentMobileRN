import User from "../models/user.js";
import dotenv from "dotenv";
import Subject from "../models/subjects.js";
dotenv.config();

export const createSubject = async (req, res,next) => {
    const { subjectName, subjectDescription, subjectImage, subjectPrice, subjectBoard, subjectGrade,subjectDuration } = req.body;

    if (!subjectName || !subjectDescription || !subjectImage || !subjectPrice || !subjectBoard || !subjectGrade) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try{
        if( req.isTeacher === true ){

            const newSubject = new Subject({
                ...req.body,
                subjectPrice: parseInt(subjectPrice),
                subjectGrade: parseInt(subjectGrade),
                subjectDuration: parseInt(subjectDuration),
                user: req.userId
            });
            const savedSubject = await newSubject.save();
            const updateUser = await User.findById(req.userId);
            updateUser.subjects.push(savedSubject._id);
            await updateUser.save();
    
    
    
            return  res.status(202).json({ message: "Subject Created", savedSubject });
        }
        else{
            return  res.status(400).json({ message: "Only teachers can create subjects" });
        }

        
    }
    catch(err){
        console.log(err,'Error in createSubject api');
        next(err);
    }
}
export const getAllSubjects = async (req, res, next) => {
    try{
        const subjects = await Subject.find({subjectVerification:true}).populate('user', 'name profileImage');
        res.status(200).json(subjects);

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export const getAllSubjectsBySearch = async (req, res, next) => {
    const { subjectGrade,subjectBoard,subjectTeacher,subjectTags } = req.query;
    const grade = parseInt(subjectGrade);
    console.log('subjectTags',typeof subjectTags);
   
    try {
        let filter = { subjectVerification: true };
        if (!isNaN(grade)) {
            filter.subjectGrade = grade;
        }
        if (subjectBoard !== undefined) {
            filter.subjectBoard = subjectBoard;
        }
        let newfilter ={subjectVerification:true,
            ...(!isNaN(grade) && {subjectGrade:grade}),
            ...(subjectBoard !== "undefined" && {subjectBoard:{$regex:subjectBoard,$options:'i'}}),
            ...(subjectTags !== "undefined" && {subjectTags:{$regex:subjectTags,$options:'i'}}),
        };
        console.log('newfilter',newfilter);

        const subjects = await Subject.find(newfilter).populate('user', 'name profileImage');
        res.status(200).json(subjects);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const getOneSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.subjectId).populate('user', '-password -subjects -userDescription');
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

export const updateSubject = async (req, res, next) => {
    try {
        if(!req.isTeacher){
            return res.status(400).json({message:"Only teachers can view subjects"});
        }
        const user = await User.findById(req.userId);
        if (!(user.subjects.includes(req.params.subjectId))) {
            return res.status(400).json({ message: "You are not authorized to Edit11 this subject" });

        }
        const subject = await Subject.findById(req.params.subjectId);
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        const updatedSubject = await Subject.findByIdAndUpdate(req.params.subjectId, {...req.body,subjectVerification:false}, { new: true });
        return res.status(200).json({ message: "Subject Updated", updatedSubject });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const deleteSubject = async (req, res, next) => {
    try {
        if(!req.isTeacher){
            return res.status(400).json({message:"Only teachers can view subjects"});
        }
        const user = await User.findById(req.userId);
        if (!(user.subjects.includes(req.params.subjectId))) {
            return res.status(400).json({ message: "You are not authorized to Delete this subject" });

        }
        const subject = await Subject.findById(req.params.subjectId);
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        await Subject.findByIdAndDelete(req.params.subjectId);
        return res.status(200).json({ message: "Subject Deleted" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const getAllSubjectsToVerify = async (req, res,next) => {
    try {
        
        const subjects = await Subject.find({subjectVerification:false});
        return res.status(200).json(subjects);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const verifySubject = async (req, res,next) => {
    console.log('inside verifySubject routeeeeee');
    try{
        if(!req.isAdmin){
            return res.status(400).json({message:"Only admin can Verify Subjects"});
        }
        console.log('qqqqqqqqqqqqqqqqqqqqqq');
        const subject = await Subject.findById(req.params.subjectId);
        console.log(subject,'aaaaaaaaaaaaaaaaaaa')
        if(!subject){
            return res.status(400).json({message:"Subject not found"});
        }
        console.log(subject, "subject in route");
        if(subject.subjectVerification === true){
            return res.status(400).json({message:"Subject already verified"});
        }
        subject.subjectVerification = true;
        const newUpdatedSubject = await subject.save();
        console.log(newUpdatedSubject,'newUpdatedSubject');
        return  res.status(200).json({message:"Subject Verified"});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export const getRecommendedSubjects = async (req, res, next) => {
    console.log(req.body,'req.body');
    const {recommendedSubjects,recommendedBoard, recommendedGrade} = req.body;
    
    
    try {
        const filteredSubjects = await Subject.find({
            subjectSearchHeading: { $in: recommendedSubjects },
            subjectBoard: recommendedBoard ,
            subjectGrade:  recommendedGrade 
        }).populate('user', 'name profileImage');
        console.log(filteredSubjects,'filteredSubjects');
        
        res.status(200).json(filteredSubjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
