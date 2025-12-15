import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { sendEmailService } from "../services/emailService.js";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.COACH_ACADEM_RESEND_API_KEY);

export const createSubject = async (req, res, next) => {
    const { 
        subjectName, 
        subjectDescription, 
        subjectImage, 
        subjectPrice, 
        subjectBoard, 
        subjectGrade, 
        subjectDuration, 
        subjectNameSubHeading,
        subjectSearchHeading, 
        subjectLanguage, 
        subjectPoints,
        teacherVerification,
        courseType,
        scheduledDateTime,
        maxCapacity
    } = req.body;

    console.log(req.userId,'req.userId');
    
    // Check for required fields
    if (!subjectName || !subjectDescription || !subjectImage || !subjectPrice || !subjectBoard || !subjectGrade) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        // Check if user is a teacher
        if (req.userType !== 'TEACHER') {
            return res.status(400).json({ message: "Only teachers can create subjects" });
        }

        // Validate multi-student course requirements
        if (courseType === 'MULTI_STUDENT') {
            if (!scheduledDateTime) {
                return res.status(400).json({ message: "Scheduled date and time is required for multi-student courses" });
            }
            if (!maxCapacity || maxCapacity < 1) {
                return res.status(400).json({ message: "Max capacity must be at least 1 for multi-student courses" });
            }
            // Validate scheduledDateTime is in the future
            const scheduledDate = new Date(scheduledDateTime);
            if (scheduledDate <= new Date()) {
                return res.status(400).json({ message: "Scheduled date and time must be in the future" });
            }
        }

        // Get TeacherProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                teacherProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.teacherProfile) {
            return res.status(400).json({ message: "Teacher profile not found" });
        }

        const teacherProfileId = user.teacherProfile.id;

        // Prepare subject data
        const subjectData = {
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
            teacherId: teacherProfileId,
            courseType: courseType || 'SINGLE_STUDENT',
            maxCapacity: courseType === 'MULTI_STUDENT' ? parseInt(maxCapacity) : 1,
            currentEnrollment: 0,
        };

        // Add scheduledDateTime only for multi-student courses
        if (courseType === 'MULTI_STUDENT' && scheduledDateTime) {
            subjectData.scheduledDateTime = new Date(scheduledDateTime);
        }

        // Create a new subject with teacherId (TeacherProfile.id)
        const newSubject = await prisma.subject.create({
            data: subjectData,
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

            // Notify admin about new subject creation using Resend
            try {
                const adminEmail ="mickeygenerale@gmail.com";

                await resend.emails.send({
                    from: process.env.COACH_ACADEM_RESEND_EMAIL,
                    to: adminEmail,
                    subject: `New Subject Created: ${subjectName}`,
                    html: emailHtml,
                });
            } catch (emailErr) {
                console.error("Error sending admin subject notification email", emailErr);
            }


            return res.status(202).json({ message: "Subject Created", newSubject });
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
                    subjectVerification: true
                },
                include: {
                    teacherProfile: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    profileImage: true
                                }
                            }
                        }
                    }
                }
            });
            
            // Transform response to match expected format
            const transformedSubjects = subjects.map(subject => ({
                ...subject,
                user: {
                    name: subject.teacherProfile?.user?.name,
                    profileImage: subject.teacherProfile?.user?.profileImage
                }
            }));
            
            return res.status(200).json(transformedSubjects);
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
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            }
        });

        // Transform response to match expected format
        const transformedSubjects = subjects.map(subject => ({
            ...subject,
            user: {
                name: subject.teacherProfile?.user?.name,
                profileImage: subject.teacherProfile?.user?.profileImage
            }
        }));

        res.status(200).json(transformedSubjects);
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
        // Step 1: Get user's StudentProfile if they are a student
        let studentProfileId = null;
        if (currentUserId) {
            const user = await prisma.user.findUnique({
                where: { id: currentUserId },
                include: {
                    studentProfile: {
                        select: { id: true }
                    }
                }
            });
            studentProfileId = user?.studentProfile?.id;
        }

        // Step 2: Get all blocked teacher profile IDs for this student
        let blockedTeacherProfileIds = [];
        if (studentProfileId) {
            const blocked = await prisma.blockedTeacher.findMany({
                where: {
                    studentId: studentProfileId,
                },
                select: {
                    teacherId: true, // This is TeacherProfile.id
                },
            });
            blockedTeacherProfileIds = blocked.map(b => b.teacherId);
        }

        // Step 3: Construct the filter with exclusions
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
            ...(blockedTeacherProfileIds.length > 0 && {
                NOT: {
                    teacherId: {
                        in: blockedTeacherProfileIds,
                    },
                },
            }),
        };

        // Step 4: Fetch filtered subjects
        const subjects = await prisma.subject.findMany({
            where: filter,
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
        });

        // Transform response to match expected format
        const transformedSubjects = subjects.map(subject => ({
            ...subject,
            user: {
                name: subject.teacherProfile?.user?.name,
                profileImage: subject.teacherProfile?.user?.profileImage
            }
        }));

        res.status(200).json(transformedSubjects);
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
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: 'desc' // Order by creation date, newest first
            }
        });

        // Transform response to match expected format
        const transformedSubjects = subjects.map(subject => ({
            ...subject,
            user: {
                name: subject.teacherProfile?.user?.name,
                profileImage: subject.teacherProfile?.user?.profileImage
            }
        }));

        res.status(200).json({
            subjects: transformedSubjects,
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

        // Fetch the subject by ID and include the related teacher profile data
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profileImage: true,
                                userType: true,
                            },
                        },
                    },
                },
            },
        });

        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }

        // Transform response to match expected format
        const response = {
            ...subject,
            user: {
                id: subject.teacherProfile?.user?.id,
                name: subject.teacherProfile?.user?.name,
                email: subject.teacherProfile?.user?.email,
                profileImage: subject.teacherProfile?.user?.profileImage,
                userType: subject.teacherProfile?.user?.userType,
            },
        };

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const updateSubject = async (req, res, next) => {
    try {
        if(req.userType !== 'TEACHER'){
            return res.status(400).json({message:"Only teachers can update subjects"});
        }

        const { subjectId } = req.params;

        // Get TeacherProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                teacherProfile: {
                    include: {
                        subjects: {
                            select: { id: true }
                        }
                    }
                }
            }
        });

        if (!user || !user.teacherProfile) {
            return res.status(400).json({ message: "Teacher profile not found" });
        }

        // Check if subject belongs to this teacher
        const subjectBelongsToTeacher = user.teacherProfile.subjects.some(s => s.id === subjectId);
        if (!subjectBelongsToTeacher) {
            return res.status(400).json({ message: "You are not authorized to edit this subject" });
        }

        // Update subject
        const updatedSubject = await prisma.subject.update({
            where: { id: subjectId },
            data: {
                ...req.body,
                subjectVerification: false // Reset verification when updated
            }
        });

        return res.status(200).json({ message: "Subject Updated", updatedSubject });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const deleteSubject = async (req, res, next) => {
    try {
        if(req.userType !== 'TEACHER'){
            return res.status(400).json({message:"Only teachers can delete subjects"});
        }

        const { subjectId } = req.params;

        // Get TeacherProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                teacherProfile: {
                    include: {
                        subjects: {
                            select: { id: true }
                        }
                    }
                }
            }
        });

        if (!user || !user.teacherProfile) {
            return res.status(400).json({ message: "Teacher profile not found" });
        }

        // Check if subject belongs to this teacher
        const subjectBelongsToTeacher = user.teacherProfile.subjects.some(s => s.id === subjectId);
        if (!subjectBelongsToTeacher) {
            return res.status(400).json({ message: "You are not authorized to delete this subject" });
        }

        // Check if subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId }
        });

        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }

        // Delete subject
        await prisma.subject.delete({
            where: { id: subjectId }
        });

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

        // Fetch the subject by ID with teacher info
        const subject = await prisma.subject.findUnique({
            where: { id: req.params.subjectId },
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
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
        let updatedSubject = await prisma.subject.update({
            where: { id: req.params.subjectId },
            data: { subjectVerification: true },
        });

        // If it's a multi-student course and Zoom meeting hasn't been created yet, create it
        if (subject.courseType === 'MULTI_STUDENT' && !subject.zoomMeetingId && subject.scheduledDateTime) {
            try {
                const { createZoomMeeting } = await import('../services/zoomService.js');
                const teacherEmail = subject.teacherProfile?.user?.email;
                const teacherName = subject.teacherProfile?.user?.name || subject.subjectName;

                if (!teacherEmail) {
                    console.error('Teacher email not found for Zoom meeting creation');
                } else {
                    // Calculate duration in minutes
                    const durationInMinutes = subject.subjectDuration * 60;
                    
                    // Create Zoom meeting with participant limit (teacher + maxCapacity students)
                    const participantLimit = subject.maxCapacity + 1; // teacher + students
                    
                    const meeting = await createZoomMeeting(
                        teacherEmail,
                        subject.subjectName,
                        new Date(subject.scheduledDateTime),
                        durationInMinutes,
                        participantLimit
                    );

                    if (meeting && meeting.id) {
                        // Update subject with Zoom meeting details
                        updatedSubject = await prisma.subject.update({
                            where: { id: req.params.subjectId },
                            data: {
                                zoomMeetingId: meeting.id,
                                zoomMeetingPassword: meeting.password || null,
                                zoomMeetingUrl: meeting.join_url || null,
                            },
                        });

                        console.log('Zoom meeting created for multi-student course:', meeting.id);
                    }
                }
            } catch (zoomError) {
                console.error('Error creating Zoom meeting during verification:', zoomError);
                // Don't fail verification if Zoom creation fails, just log it
            }
        }

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
        // Build where condition
        const whereCondition = {
            subjectVerification: true,
            subjectBoard: recommendedBoard,
            subjectGrade: parseInt(recommendedGrade)
        };

        // Add subjectSearchHeading filter if recommendedSubjects is provided
        if (recommendedSubjects && Array.isArray(recommendedSubjects) && recommendedSubjects.length > 0) {
            whereCondition.subjectSearchHeading = {
                in: recommendedSubjects
            };
        }

        const filteredSubjects = await prisma.subject.findMany({
            where: whereCondition,
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            }
        });

        // Transform response to match expected format
        const transformedSubjects = filteredSubjects.map(subject => ({
            ...subject,
            user: {
                name: subject.teacherProfile?.user?.name,
                profileImage: subject.teacherProfile?.user?.profileImage
            }
        }));

        console.log(transformedSubjects,'filteredSubjects');
        
        res.status(200).json(transformedSubjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

export const getSavedSubjects = async (req, res, next) => {
    try {
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        const savedSubjects = await prisma.savedSubject.findMany({
            where: { studentId: user.studentProfile.id },
            include: {
                subject: {
                    include: {
                        teacherProfile: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        profileImage: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json(savedSubjects);
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export const saveSubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        const savedSubject = await prisma.savedSubject.create({
            data: {
                subjectId,
                studentId: user.studentProfile.id,
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
        
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        const savedSubject = await prisma.savedSubject.delete({
            where: { 
                subjectId_studentId: {
                    subjectId: subjectId,
                    studentId: user.studentProfile.id
                }
            },
        });
        res.status(200).json({ message: "Subject unsaved", savedSubject });
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export const getSubjectCapacity = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            select: {
                courseType: true,
                maxCapacity: true,
                currentEnrollment: true,
                subjectVerification: true,
            },
        });

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const availableSpots = Math.max(0, subject.maxCapacity - subject.currentEnrollment);

        res.status(200).json({
            courseType: subject.courseType,
            maxCapacity: subject.maxCapacity,
            currentEnrollment: subject.currentEnrollment,
            availableSpots,
            isFull: availableSpots === 0,
            isVerified: subject.subjectVerification,
        });
    } catch (error) {
        console.error('Error fetching subject capacity:', error);
        next(error);
    }
};

export const getMultiStudentSubjects = async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                courseType: 'MULTI_STUDENT',
                subjectVerification: true,
            },
            include: {
                teacherProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform response to match expected format
        const transformedSubjects = subjects.map(subject => ({
            ...subject,
            user: {
                name: subject.teacherProfile?.user?.name,
                profileImage: subject.teacherProfile?.user?.profileImage,
            },
            availableSpots: Math.max(0, subject.maxCapacity - subject.currentEnrollment),
        }));

        res.status(200).json(transformedSubjects);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

