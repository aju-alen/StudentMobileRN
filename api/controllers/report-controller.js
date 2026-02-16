import {PrismaClient} from "@prisma/client";
import { sendEmailService } from "../services/emailService.js";
const prisma = new PrismaClient();


export const reportSubject = async (req, res, next) => {
    const {subjectId, reportReason} = req.body;
    const userId = req.userId;
    const userEmail = req.email;
    try {
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        // Create the report record
        const report = await prisma.report.create({
            data: {
                subjectId,
                reportDescription: reportReason,
                studentId: user.studentProfile.id
            }
        });

        // Send emails after successful report creation
        await Promise.all([
            sendEmailService(
                process.env.NAMECHEAP_EMAIL,
                "⚠️ New Report Alert",
                `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                    <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                            <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                            <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                        </div>
                        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">New Report Alert</h1>
                    </div>

                    <div style="padding: 40px 20px; background-color: #ffffff;">
                        <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
                            <h3 style="color: #1A2B4B; font-size: 18px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">Report Details</h3>
                            <p style="margin: 10px 0; color: #64748B;"><strong>User ID:</strong> ${userId}</p>
                            <p style="margin: 10px 0; color: #64748B;"><strong>Subject ID:</strong> ${subjectId}</p>
                            <p style="margin: 10px 0; color: #64748B;"><strong>Reason:</strong> ${reportReason}</p>
                        </div>

                        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                            <p style="margin: 0; color: #64748B; font-size: 14px;">Please review this report and take appropriate action.</p>
                        </div>
                    </div>
                </div>
                `
            ),
            sendEmailService(
                userEmail,
                "Report Submission Confirmation",
                `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                    <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                            <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                            <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                        </div>
                        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Report Submitted</h1>
                    </div>

                    <div style="padding: 40px 20px; background-color: #ffffff;">
                        <p style="margin: 0 0 20px 0; color: #64748B; font-size: 16px; line-height: 1.6;">
                            Thank you for bringing this to our attention. Your report has been successfully submitted and will be reviewed by our team.
                        </p>
                        <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
                            <p style="margin: 0; color: #64748B; font-size: 14px;">
                                <strong>Report Details:</strong><br>
                                Subject ID: ${subjectId}<br>
                                Reason: ${reportReason}
                            </p>
                        </div>

                        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                            <p style="margin: 0; color: #64748B; font-size: 14px;">
                                We take all reports seriously and will investigate this matter thoroughly.
                            </p>
                        </div>
                    </div>
                </div>
                `
            )
        ]);

        return res.status(200).json({message: "Report created successfully"});
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const blockUser = async (req, res,next) => {
    const userId = req.userId;
    const {subjectId} = req.body;
    try {
        // Get StudentProfile.id from User.id (the blocking student)
        const studentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!studentUser || !studentUser.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        // Get TeacherProfile.id from subject
        const subject = await prisma.subject.findUnique({
            where: {
                id: subjectId
            },
            include: {
                teacherProfile: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!subject || !subject.teacherProfile) {
            return res.status(400).json({ message: "Subject or teacher not found" });
        }

        const blockSubjectTeacher = await prisma.blockedTeacher.findUnique({
            where: {
                studentId_teacherId: {
                    studentId: studentUser.studentProfile.id,
                    teacherId: subject.teacherProfile.id
                }
            }
        })
        
        if (blockSubjectTeacher) {
            return res.status(400).json({message: "You have already blocked this user"});
        }

        const blockUser = await prisma.blockedTeacher.create({
            data: {
                studentId: studentUser.studentProfile.id,
                teacherId: subject.teacherProfile.id
            }
        })

        return res.status(200).json({message: "User blocked successfully"});
        
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const getUserReports = async (req, res, next) => {
    const userId = req.userId;
    try {
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        const reports = await prisma.report.findMany({
            where: {
                studentId: user.studentProfile.id
            },
            include: {
                reportedSubject: {
                    select: {
                        subjectName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(reports);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const getBlockedUsers = async (req, res, next) => {
    const userId = req.userId;
    try {
        // Get StudentProfile.id from User.id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user || !user.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        const blockedUsers = await prisma.blockedTeacher.findMany({
            where: {
                studentId: user.studentProfile.id
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform response to match expected format
        const transformedBlockedUsers = blockedUsers.map(blocked => ({
            ...blocked,
            blockedTeacher: blocked.teacher.user
        }));

        return res.status(200).json(transformedBlockedUsers);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const unblockUser = async (req, res, next) => {
    const userId = req.userId;
    const { blockedTeacherId } = req.body; // This is User.id, need to convert to TeacherProfile.id
    try {
        // Get StudentProfile.id from User.id (the unblocking student)
        const studentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                }
            }
        });

        if (!studentUser || !studentUser.studentProfile) {
            return res.status(400).json({ message: "Student profile not found" });
        }

        // Get TeacherProfile.id from User.id (the blocked teacher)
        const teacherUser = await prisma.user.findUnique({
            where: { id: blockedTeacherId },
            include: {
                teacherProfile: {
                    select: { id: true }
                }
            }
        });

        if (!teacherUser || !teacherUser.teacherProfile) {
            return res.status(400).json({ message: "Teacher profile not found" });
        }

        const findBlockedRecord = await prisma.blockedTeacher.findUnique({
            where: {
                studentId_teacherId: {
                    studentId: studentUser.studentProfile.id,
                    teacherId: teacherUser.teacherProfile.id
                }
            },
           
        });

        if (!findBlockedRecord) {
            return res.status(400).json({ message: "User not found in blocked list" });
        }

        await prisma.blockedTeacher.delete({
            where: {
                studentId_teacherId: {
                    studentId: studentUser.studentProfile.id,
                    teacherId: teacherUser.teacherProfile.id
                }
            }
        });

        return res.status(200).json({ message: "User unblocked successfully" });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const getAllReports = async (req, res, next) => {
    try {
        const reports = await prisma.report.findMany();
        return res.status(200).json(reports);
    } catch (err) {
        console.log(err);
        next(err);
    }
}