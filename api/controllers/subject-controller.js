import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createSubject = async (req, res, next) => {
    const { subjectName, subjectDescription, subjectImage, subjectPrice, subjectBoard, subjectGrade, subjectDuration, subjectNameSubHeading,subjectSearchHeading, subjectLanguage, subjectPoints,teacherVerification } = req.body;

    console.log(req.userId,'req.userId');
    
    // Check for required fields
    if (!subjectName || !subjectDescription || !subjectImage || !subjectPrice || !subjectBoard || !subjectGrade) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        if (req.isTeacher === true) {
            // Create a new subject
            const newSubject = await prisma.subject.create({
                data: {
                    subjectName,
                    subjectDescription,
                    subjectImage,
                    subjectPrice: parseInt(subjectPrice) * 100,
                    subjectBoard,
                    subjectGrade: parseInt(subjectGrade),
                    subjectDuration: parseInt(subjectDuration),
                    subjectNameSubHeading,
                    subjectSearchHeading,
                    subjectLanguage,
                    subjectPoints,
                    teacherVerification,
                    userId: req.userId, // Assuming `userId` matches the Prisma model
                },
            });

            // Update the user's subjects list
            await prisma.user.update({
                where: { id: req.userId },
                data: {
                    subjects: {
                        connect: { id: newSubject.id },
                    },
                },
            });

            return res.status(202).json({ message: "Subject Created", newSubject });
        } else {
            return res.status(400).json({ message: "Only teachers can create subjects" });
        }
    } catch (err) {
        console.error(err, "Error in createSubject API");
        next(err);
    }
};

export const getAllSubjects = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q || q === '') {
            const subjects = await prisma.subject.findMany({
                where: {
                    AND: [
                        { subjectVerification: true },
                        {
                            OR: [
                                { subjectName: { contains: searchTerm, mode: 'insensitive' } },
                                { subjectDescription: { contains: searchTerm, mode: 'insensitive' } },
                                { subjectTags: { has: searchTerm } } // <-- corrected here
                            ]
                        }
                    ]
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            profileImage: true
                        }
                    }
                }
            });
            
            return res.status(200).json(subjects);
        }

        const searchTerm = q.toString().toLowerCase();
        
        const subjects = await prisma.subject.findMany({
            where: {
                AND: [
                    { subjectVerification: true },
                    {
                        OR: [
                            { subjectName: { contains: searchTerm, mode: 'insensitive' } },
                            { subjectDescription: { contains: searchTerm, mode: 'insensitive' } },
                            { subjectTags: { array_contains: [searchTerm] } }
                        ]
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(200).json(subjects);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const getAllSubjectsBySearch = async (req, res, next) => {
    const { subjectGrade, subjectBoard, subjectTags } = req.query;
    const grade = parseInt(subjectGrade);
    const currentUserId = req.userId;

    try {
        // Step 1: Get all blocked teacher IDs for this user
        const blocked = await prisma.blockedTeacher.findMany({
            where: {
                userId: currentUserId,
            },
            select: {
                blockedTeacherId: true,
            },
        });

        const blockedTeacherIds = blocked.map(b => b.blockedTeacherId);

        // Step 2: Construct the filter with exclusions
        const filter = {
            subjectVerification: true,
            ...(grade && !isNaN(grade) && { subjectGrade: grade }),
            ...(subjectBoard && subjectBoard !== "undefined" && {
                subjectBoard: {
                    contains: subjectBoard,
                    mode: "insensitive",
                },
            }),
            ...(subjectTags && subjectTags !== "undefined" && {
                subjectTags: {
                    contains: subjectTags,
                    mode: "insensitive",
                },
            }),
            ...(blockedTeacherIds.length > 0 && {
                NOT: {
                    userId: {
                        in: blockedTeacherIds,
                    },
                },
            }),
        };

        // Step 3: Fetch filtered subjects
        const subjects = await prisma.subject.findMany({
            where: filter,
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true,
                    },
                },
            },
        });

        res.status(200).json(subjects);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const getAllSubjectsByAdvanceSearch = async (req, res, next) => {
    const { q } = req.query; // q from query params will be a string or undefined

    try {
        // It's good practice to ensure 'q' is a non-empty string.
        if (!q || typeof q !== 'string' || q.trim() === '') {
            // Option: Return empty array, all verified subjects, or an error.
            // For this example, returning an empty array for an invalid/empty search.
            return res.status(200).json([]);
        }

        const searchTerm = q.toLowerCase();

        const subjects = await prisma.subject.findMany({
            where: {
                AND: [
                    { subjectVerification: true },
                    {
                        OR: [
                            { subjectName: { contains: searchTerm } },
                            { subjectDescription: { contains: searchTerm } },
                            { subjectSearchHeading: { contains: searchTerm } },
                            { subjectNameSubHeading: { contains: searchTerm } }
                        ]
                    }
                ]
            },
            include: {
                user: { // Assuming 'user' is the correct relation name
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            }
        });

        res.status(200).json(subjects);
    }
    catch (err) {
        console.error(err);
        next(err); // Pass error to your Express error handler
    }
};

export const getOneSubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        // Fetch the subject by ID and include the related user data
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        // Exclude sensitive fields like password and userDescription
                        password: false,
                        userDescription: false,
                        subjects: false,
                        profileImage: true,
                    },
                },
            },
        });

        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        const addUserAdmin = {
            ...subject,
            user: {
                ...subject.user,
                isTeacher: req.isTeacher,
            },
        }

        res.status(200).json(addUserAdmin);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

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

export const getAllSubjectsToVerify = async (req, res, next) => {
    try {
        // Fetch subjects where subjectVerification is false
        const subjects = await prisma.subject.findMany({
            where: {
                subjectVerification: false,
            },
        });

        return res.status(200).json(subjects);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const verifySubject = async (req, res, next) => {
    console.log("Inside verifySubject route");

    try {
        // Check if the user is an admin
        if (!req.isAdmin) {
            return res.status(400).json({ message: "Only admin can verify subjects" });
        }

        console.log("Admin access granted");

        // Fetch the subject by ID
        const subject = await prisma.subject.findUnique({
            where: { id: req.params.subjectId },
        });

        console.log(subject, "Fetched subject");

        // Check if the subject exists
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }

        // Check if the subject is already verified
        if (subject.subjectVerification === true) {
            return res.status(400).json({ message: "Subject already verified" });
        }

        // Update the subject verification status
        const updatedSubject = await prisma.subject.update({
            where: { id: req.params.subjectId },
            data: { subjectVerification: true },
        });

        console.log(updatedSubject, "Subject verified successfully");

        return res.status(200).json({ message: "Subject Verified" });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

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

export const getSavedSubjects = async (req, res, next) => {
    try {
        const savedSubjects = await prisma.savedSubject.findMany({
            where: { userId: req.userId },
            include: {
                subject: true
            }
        });
        res.status(200).json(savedSubjects);
    } catch (err) {
        console.error(err);
}
}

export const saveSubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.userId;

        const savedSubject = await prisma.savedSubject.create({
            data: {
                subjectId,
                userId,
            },
        }); 
        res.status(200).json({ message: "Subject saved", savedSubject });
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export const unsaveSubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.userId;

        const savedSubject = await prisma.savedSubject.delete({
            where: { 
                subjectId_userId: {
                    subjectId: subjectId,
                    userId: userId
                }
            },
        });
        res.status(200).json({ message: "Subject unsaved", savedSubject });
    } catch (err) {
        console.error(err);
        next(err);
    }
}

