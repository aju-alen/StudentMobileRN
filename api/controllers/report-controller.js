import {PrismaClient} from "@prisma/client";
import { sendEmailService } from "../services/emailService.js";
const prisma = new PrismaClient();


export const reportSubject = async (req, res,next) => {
    const {subjectId,reportReason} = req.body;
    const userId = req.userId;
    const userEmail = req.email;
    try {
        const report = await prisma.$transaction(async (tx) => {
            // Create the report record
            const report = await tx.report.create({
                data: {
                    subjectId,
                    reportDescription: reportReason,
                    userId
                }
            });

            // If we reach here, the database operation was successful
            // Now send the emails
            await Promise.all([
                sendEmailService(
                    process.env.EMAIL,
                    "New Report",
                    `A new report has been created by ${userId} for subject ${subjectId} with reason ${reportReason}`
                ),
                sendEmailService(
                    userEmail,
                    "Subject Report Submitted",
                    `Your report has been submitted to the admin. We will review it and take action if necessary.`
                )
            ]);
        });

        return res.status(200).json({message:"Report created successfully"});
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
        const findSubjectTeacher = await prisma.subject.findUnique({
            where: {
                id: subjectId
            },
            select: {
                user: {
                    select: {
                        id: true
                    }
                }
            }
        })

        const blockSubjectTeacher = await prisma.blockedTeacher.findUnique({
            where: {
                userId_blockedTeacherId: {
                    userId: userId,
                    blockedTeacherId: findSubjectTeacher.user.id
                }
            }
        })
        
        if (blockSubjectTeacher) {
            return res.status(400).json({message: "You have already blocked this user"});
        }

        const blockUser = await prisma.blockedTeacher.create({
            data: {
                userId: userId,
                blockedTeacherId: findSubjectTeacher.user.id
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
        const reports = await prisma.report.findMany({
            where: {
                userId: userId
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
        const blockedUsers = await prisma.blockedTeacher.findMany({
            where: {
                userId: userId
            },
            include: {
                blockedTeacher: {
                    select: {
                        name: true,
                        email: true,
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(blockedUsers);
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const unblockUser = async (req, res, next) => {
    const userId = req.userId;
    const { blockedTeacherId } = req.body;
    try {
        const findBlockedRecord = await prisma.blockedTeacher.findUnique({
            where: {
                userId_blockedTeacherId: {
                    userId: userId,
                    blockedTeacherId: blockedTeacherId
                }
            },
           
        });

        if (!findBlockedRecord) {
            return res.status(400).json({ message: "User not found in blocked list" });
        }

        await prisma.blockedTeacher.delete({
            where: {
                userId_blockedTeacherId: {
                    userId: userId,
                    blockedTeacherId
                }
            }
        });

        return res.status(200).json({ message: "User unblocked successfully" });
    } catch (err) {
        console.log(err);
        next(err);
    }
}