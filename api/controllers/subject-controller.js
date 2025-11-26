import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { sendEmailService } from "../services/emailService.js";
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

            const emailHtml = `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                    <!-- Bauhaus Header -->
                    <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                            <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                            <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                        </div>
                        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Subject Created</h1>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px 20px; background-color: #ffffff;">
                        <div style="margin-bottom: 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background-color: #1A2B4B; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; transform: rotate(45deg);">
                                <span style="color: #ffffff; font-size: 40px; transform: rotate(-45deg);">✓</span>
                            </div>
                            <h2 style="color: #1A2B4B; font-size: 24px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">${subjectName}</h2>
                            <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0;">Your subject has been created and is now pending verification.</p>
                        </div>

                        <!-- Bauhaus Info Box -->
                        <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
                            <h3 style="color: #1A2B4B; font-size: 18px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
                            <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 15px;">
                                Our admin team will review your subject to ensure it meets our quality standards. This process typically takes 24-48 hours.
                            </p>
                            <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0;">
                                You'll receive another email once your subject has been verified and is live on the platform.
                            </p>
                        </div>

                        <!-- Bauhaus Footer -->
                        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                            <p style="color: #64748B; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Thank you for contributing</p>
                            <p style="color: #1A2B4B; font-size: 16px; font-weight: 700; margin: 0;">The Coach Academ Team</p>
                        </div>
                    </div>
                </div>
            `;

            // sendEmailService(req.email, "Subject Created", emailHtml);

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
    const { q, page = '1' } = req.query; // Add page parameter with default value of 1
    const pageSize = 5; // Number of subjects per page
    const pageNumber = parseInt(page);

    try {
        let whereCondition = {
            subjectVerification: true
        };

        // Only add search conditions if q is provided and not empty
        if (q && typeof q === 'string' && q.trim() !== '') {
            const searchTerm = q.toLowerCase();
            whereCondition = {
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
            };
        }

        // Get total count for pagination
        const totalSubjects = await prisma.subject.count({
            where: whereCondition
        });

        const subjects = await prisma.subject.findMany({
            where: whereCondition,
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true
                    }
                }
            },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: 'desc' // Order by creation date, newest first
            }
        });

        res.status(200).json({
            subjects,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalSubjects / pageSize),
                totalSubjects,
                hasMore: pageNumber * pageSize < totalSubjects
            }
        });
    }
    catch (err) {
        console.error(err);
        next(err);
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

