import {PrismaClient} from "@prisma/client";
import { sendEmailService } from "../services/emailService.js";
const prisma = new PrismaClient();


export const reportSubject = async (req, res, next) => {
    const {subjectId, reportReason} = req.body;
    const userId = req.userId;
    const userEmail = req.email;
    try {
        // Create the report record
        const report = await prisma.report.create({
            data: {
                subjectId,
                reportDescription: reportReason,
                userId
            }
        });

        // Send emails after successful report creation
        await Promise.all([
            sendEmailService(
                process.env.NAMECHEAP_EMAIL,
                "⚠️ New Report Alert",
                `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 2px solid #1A4C6E;">
                    <div style="background-color: #1A4C6E; color: #ffffff; padding: 20px; margin-bottom: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">NEW REPORT ALERT</h1>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #1A4C6E; margin-bottom: 20px;">
                        <h2 style="color: #1A4C6E; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #1A4C6E; padding-bottom: 10px;">Report Details</h2>
                        <p style="margin: 10px 0; color: #333333;"><strong>User ID:</strong> ${userId}</p>
                        <p style="margin: 10px 0; color: #333333;"><strong>Subject ID:</strong> ${subjectId}</p>
                        <p style="margin: 10px 0; color: #333333;"><strong>Reason:</strong> ${reportReason}</p>
                    </div>

                    <div style="text-align: center; padding: 20px; background-color: #f5f5f5;">
                        <p style="margin: 0; color: #666666; font-size: 14px;">Please review this report and take appropriate action.</p>
                    </div>
                </div>
                `
            ),
            sendEmailService(
                userEmail,
                "Report Submission Confirmation",
                `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 2px solid #1A4C6E;">
                    <div style="background-color: #1A4C6E; color: #ffffff; padding: 20px; margin-bottom: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">REPORT SUBMITTED</h1>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #1A4C6E; margin-bottom: 20px;">
                        <p style="margin: 10px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Thank you for bringing this to our attention. Your report has been successfully submitted and will be reviewed by our team.
                        </p>
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #1A4C6E;">
                            <p style="margin: 0; color: #333333; font-size: 14px;">
                                <strong>Report Details:</strong><br>
                                Subject ID: ${subjectId}<br>
                                Reason: ${reportReason}
                            </p>
                        </div>
                    </div>

                    <div style="text-align: center; padding: 20px; background-color: #f5f5f5;">
                        <p style="margin: 0; color: #666666; font-size: 14px;">
                            We take all reports seriously and will investigate this matter thoroughly.
                        </p>
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

export const getAllReports = async (req, res, next) => {
    try {
        const reports = await prisma.report.findMany();
        return res.status(200).json(reports);
    } catch (err) {
        console.log(err);
        next(err);
    }
}