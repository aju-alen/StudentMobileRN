import { BookingStatus, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { createZoomAccountForTeacher, createZoomMeeting } from "../services/zoomService.js";
dotenv.config();
import Stripe from 'stripe';
import { sendEmailService } from "../services/emailService.js";
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
const resend = new Resend(process.env.COACH_ACADEM_RESEND_API_KEY);
export const getPublisherKey = async (req, res, next) => {
    try {
        const publisherKey = process.env.STRIPE_PUBLISHER_KEY;
        res.status(200).json(publisherKey);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const paymentSheet = async (req, res, next) => {
    try {
        const { amount, currency = 'aed', customerId, teacherId, subjectId, date, time, subjectDuration, teacherEmail, subjectName, userEmail, courseType, topicSlots } = req.body;
        const userId = req.body.userId;
        
        
        // Validate required parameters
        if (!amount || amount < 50) { // Minimum amount of 50 cents
            return res.status(400).json({
                error: 'Invalid amount. Minimum amount is 50.'
            });
        }
        //check if price is same as amount 
        const subject = await prisma.subject.findUnique({
            where: {
                id: subjectId
            }
        });
        if (!subject) {
            return res.status(404).json({
                error: 'Subject not found.'
            });
        }
        if (subject.subjectPrice !== amount) {
            return res.status(400).json({
                error: 'Invalid amount. Price of the subject is not same as amount.'
            });
        }

        // For multi-student and multi-package courses, check capacity before allowing payment
        if (subject.courseType === 'MULTI_STUDENT' || subject.courseType === 'MULTI_PACKAGE') {
            if (!subject.subjectVerification) {
                return res.status(400).json({
                    error: 'This course has not been verified yet.'
                });
            }
            if (subject.currentEnrollment >= subject.maxCapacity) {
                return res.status(400).json({
                    error: 'Course is full. No spots available.'
                });
            }
        }
        // Validate currency
        const validCurrencies = ['aed'];
        if (!validCurrencies.includes(currency.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid currency. Supported currencies are: AED'
            });
        }
        // Get or create customer
        let customer;
        if (customerId) {
            try {
                customer = await stripe.customers.retrieve(customerId);
            } catch (err) {
                console.log(err);
                // If customer doesn't exist, create a new one
                customer = await stripe.customers.create();
            }
        } else {
            customer = await stripe.customers.create();
        }
        // Create ephemeral key with latest API version
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2023-10-16' }
        );
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Convert to cents
            currency: currency.toLowerCase(),
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId,
                teacherId,
                subjectId,
                date: date || '',
                time: time || '',
                subjectDuration,
                teacherEmail,
                subjectName,
                userEmail,
                courseType: subject.courseType || courseType || 'SINGLE_STUDENT',
                topicSlots: (subject.courseType === 'SINGLE_PACKAGE' && Array.isArray(topicSlots) && topicSlots.length) ? JSON.stringify(topicSlots) : ''
            }
        });

        res.json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: process.env.STRIPE_PUBLISHER_KEY
        });
    } catch (error) {
        console.error('Payment sheet error:', error);
        res.status(500).json({
            error: 'An error occurred while creating the payment sheet',
            message: error.message
        });
    }
};
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT;
export const stripeWebhook = async (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                // console.log('PaymentIntent was successful!');
                

                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                break;
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                console.log('Charge Succeeded',chargeSucceeded);

                //save the charge to the database and update bookinng details
                console.log("payment outside if");
                
                if(chargeSucceeded.status === 'succeeded' && chargeSucceeded.paid === true){
                    console.log("payment inside if");
                    const bookingTime = chargeSucceeded.metadata.date;
                    const bookingHour = chargeSucceeded.metadata.time
                    console.log('bookingTime', bookingTime);
                    console.log('bookingHour', bookingHour);
                    
                    const dateTimeString = `${bookingTime}T${bookingHour}:00+04:00`;
                    console.log('dateTimeString', dateTimeString);
                    const uaeDate = new Date(dateTimeString);
                    
                    // Check if this is the first purchase for this subject
                    const existingPurchases = await prisma.stripePurchases.findMany({
                        where: {
                            subjectId: chargeSucceeded.metadata.subjectId,
                            purchaseStatus: BookingStatus.CONFIRMED
                        }
                    });

                    const isFirstPurchase = existingPurchases.length === 0;

                    // If this is the first purchase, check if teacher needs Zoom account
                    if (isFirstPurchase) {
                        const teacher = await prisma.user.findUnique({
                            where: { id: chargeSucceeded.metadata.teacherId },
                            include: {
                                teacherProfile: {
                                    select: {
                                        id: true,
                                        zoomAccountCreated: true
                                    }
                                }
                            }
                        });

                        // if (teacher && !teacher.zoomAccountCreated) {
                        //     console.log('First purchase detected. Creating Zoom account for teacher:', teacher.email);
                            
                        //     try {
                        //         await createZoomAccountForTeacher(teacher.email, teacher.name);
                                
                        //         // Update teacher's zoomAccountCreated flag
                        //         await prisma.user.update({
                        //             where: { id: teacher.id },
                        //             data: { zoomAccountCreated: true }
                        //         });
                                
                        //         console.log('Zoom account created successfully for teacher:', teacher.email);
                        //     } catch (zoomError) {
                        //         console.error('Failed to create Zoom account after retries:', zoomError);
                                
                        //         // Send error email to admin
                        //         const errorEmailHtml = `
                        //             <html>
                        //             <head>
                        //                 <meta charset="UTF-8">
                        //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        //                 <style>
                        //                     body {
                        //                         font-family: 'Helvetica Neue', Arial, sans-serif;
                        //                         line-height: 1.6;
                        //                         margin: 0;
                        //                         padding: 0;
                        //                         background-color: #f5f5f5;
                        //                     }
                        //                     .container {
                        //                         max-width: 600px;
                        //                         margin: 0 auto;
                        //                         padding: 0;
                        //                         background-color: #ffffff;
                        //                         border: 2px solid #000;
                        //                     }
                        //                     .header {
                        //                         background-color: #FF0000;
                        //                         color: white;
                        //                         padding: 40px 20px;
                        //                         text-align: center;
                        //                     }
                        //                     .header h1 {
                        //                         margin: 0;
                        //                         font-size: 32px;
                        //                         font-weight: 900;
                        //                         text-transform: uppercase;
                        //                         letter-spacing: 3px;
                        //                     }
                        //                     .content {
                        //                         padding: 30px;
                        //                         background-color: #ffffff;
                        //                     }
                        //                     .error-box {
                        //                         background-color: #fff3cd;
                        //                         border: 2px solid #ffc107;
                        //                         padding: 20px;
                        //                         margin: 20px 0;
                        //                     }
                        //                     .error-box h3 {
                        //                         margin: 0 0 15px 0;
                        //                         color: #856404;
                        //                         text-transform: uppercase;
                        //                     }
                        //                     .detail-row {
                        //                         margin: 10px 0;
                        //                         padding: 10px 0;
                        //                         border-bottom: 1px solid #ddd;
                        //                     }
                        //                     .detail-label {
                        //                         font-weight: 700;
                        //                         color: #000;
                        //                         text-transform: uppercase;
                        //                         font-size: 12px;
                        //                         letter-spacing: 1px;
                        //                     }
                        //                     .detail-value {
                        //                         color: #333;
                        //                         margin-top: 5px;
                        //                     }
                        //                     .footer {
                        //                         text-align: center;
                        //                         padding: 30px;
                        //                         background-color: #000;
                        //                         color: white;
                        //                     }
                        //                 </style>
                        //             </head>
                        //             <body>
                        //                 <div class="container">
                        //                     <div class="header">
                        //                         <h1>Zoom Account Creation Failed</h1>
                        //                     </div>
                        //                     <div class="content">
                        //                         <p style="font-size: 18px; font-weight: 500;">Admin Alert,</p>
                        //                         <p style="font-size: 16px;">A Zoom account creation failed for a teacher after automatic retries.</p>
                                                
                        //                         <div class="error-box">
                        //                             <h3>⚠️ Error Details</h3>
                        //                             <div class="detail-row">
                        //                                 <div class="detail-label">Teacher Name</div>
                        //                                 <div class="detail-value">${teacher.name}</div>
                        //                             </div>
                        //                             <div class="detail-row">
                        //                                 <div class="detail-label">Teacher Email</div>
                        //                                 <div class="detail-value">${teacher.email}</div>
                        //                             </div>
                        //                             <div class="detail-row">
                        //                                 <div class="detail-label">Subject ID</div>
                        //                                 <div class="detail-value">${chargeSucceeded.metadata.subjectId}</div>
                        //                             </div>
                        //                             <div class="detail-row">
                        //                                 <div class="detail-label">Subject Name</div>
                        //                                 <div class="detail-value">${chargeSucceeded.metadata.subjectName}</div>
                        //                             </div>
                        //                             <div class="detail-row">
                        //                                 <div class="detail-label">Error Message</div>
                        //                                 <div class="detail-value">${zoomError.message || zoomError.response?.data?.message || 'Unknown error'}</div>
                        //                             </div>
                        //                             <div class="detail-row" style="border-bottom: none;">
                        //                                 <div class="detail-label">Error Details</div>
                        //                                 <div class="detail-value">${JSON.stringify(zoomError.response?.data || zoomError.stack || 'No additional details')}</div>
                        //                             </div>
                        //                             <div class="detail-row" style="border-bottom: none;">
                        //                                 <div class="detail-label">Timestamp</div>
                        //                                 <div class="detail-value">${new Date().toLocaleString()}</div>
                        //                             </div>
                        //                         </div>
                                                
                        //                         <p style="font-size: 16px; margin-top: 20px;">
                        //                             <strong>Action Required:</strong> Please manually create a Zoom account for this teacher and assign a Pro license. 
                        //                             The booking has been created successfully, but the teacher will need a Zoom account to host meetings.
                        //                         </p>
                        //                     </div>
                        //                     <div class="footer">
                        //                         <p style="margin: 0; font-weight: 500;">Coach Academ System</p>
                        //                     </div>
                        //                 </div>
                        //             </body>
                        //             </html>
                        //         `;

                        //         try {
                        //             await sendEmailService(
                        //                 process.env.COACH_ACADEM_RESEND_EMAIL,
                        //                 'Zoom Account Creation Failed - Action Required',
                        //                 errorEmailHtml
                        //             );
                        //             console.log('Admin notification email sent successfully');
                        //         } catch (emailError) {
                        //             console.error('Failed to send admin notification email:', emailError);
                        //         }
                        //     }
                        // }
                    }

                    // Get TeacherProfile.id and StudentProfile.id from User.id
                    const teacherUser = await prisma.user.findUnique({
                        where: { id: chargeSucceeded.metadata.teacherId },
                        include: {
                            teacherProfile: {
                                select: { id: true }
                            }
                        }
                    });

                    const studentUser = await prisma.user.findUnique({
                        where: { id: chargeSucceeded.metadata.userId },
                        include: {
                            studentProfile: {
                                select: { id: true }
                            }
                        }
                    });

                    if (!teacherUser || !teacherUser.teacherProfile) {
                        throw new Error('Teacher profile not found');
                    }

                    if (!studentUser || !studentUser.studentProfile) {
                        throw new Error('Student profile not found');
                    }

                    const teacherProfileId = teacherUser.teacherProfile.id;
                    const studentProfileId = studentUser.studentProfile.id;

                    // Check course type from metadata
                    const courseType = chargeSucceeded.metadata.courseType || 'SINGLE_STUDENT';
                    let createBooking = null;
                    let saveTransaction = null;

                    if (courseType === 'MULTI_STUDENT' || courseType === 'MULTI_PACKAGE') {
                        // Handle multi-student / multi-package course enrollment
                        // Get subject to check capacity again (double-check)
                        const subject = await prisma.subject.findUnique({
                            where: { id: chargeSucceeded.metadata.subjectId },
                            select: {
                                courseType: true,
                                maxCapacity: true,
                                currentEnrollment: true,
                                zoomMeetingUrl: true,
                                zoomMeetingPassword: true,
                                zoomMeetingId: true,
                            },
                        });

                        if (!subject || (subject.courseType !== 'MULTI_STUDENT' && subject.courseType !== 'MULTI_PACKAGE')) {
                            throw new Error('Subject is not a multi-student or multi-package course');
                        }

                        if (subject.currentEnrollment >= subject.maxCapacity) {
                            throw new Error('Course is full. Cannot enroll.');
                        }

                        // Check if student is already enrolled
                        const existingEnrollment = await prisma.courseEnrollment.findUnique({
                            where: {
                                subjectId_studentId: {
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                    studentId: studentProfileId,
                                },
                            },
                        });

                        if (existingEnrollment && existingEnrollment.enrollmentStatus !== 'CANCELLED') {
                            throw new Error('Student is already enrolled in this course');
                        }

                        // Create enrollment and stripe purchase in transaction
                        const result = await prisma.$transaction(async (tx) => {
                            // Create or update enrollment
                            let enrollment;
                            if (existingEnrollment && existingEnrollment.enrollmentStatus === 'CANCELLED') {
                                // Re-enroll if previously cancelled
                                enrollment = await tx.courseEnrollment.update({
                                    where: { id: existingEnrollment.id },
                                    data: {
                                        enrollmentStatus: 'CONFIRMED',
                                        enrolledAt: new Date(),
                                    },
                                });
                            } else {
                                // Create new enrollment
                                enrollment = await tx.courseEnrollment.create({
                                    data: {
                                        subjectId: chargeSucceeded.metadata.subjectId,
                                        studentId: studentProfileId,
                                        enrollmentStatus: 'CONFIRMED',
                                    },
                                });
                            }

                            // Increment enrollment count
                            await tx.subject.update({
                                where: { id: chargeSucceeded.metadata.subjectId },
                                data: {
                                    currentEnrollment: {
                                        increment: 1,
                                    },
                                },
                            });

                            // Create stripe purchase with enrollment reference
                            const saveTransaction = await tx.stripePurchases.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                    purchaseStatus: BookingStatus.CONFIRMED,
                                    purchaseAmount: chargeSucceeded.amount,
                                    purchaseCurrency: chargeSucceeded.currency,
                                    stripeCustomerId: chargeSucceeded.customer,
                                    purchaseReceiptUrl: chargeSucceeded.receipt_url,
                                    courseEnrollmentId: enrollment.id, // Link to enrollment instead of booking
                                },
                            });

                            return { saveTransaction, createEnrollment: enrollment };
                        });
                        saveTransaction = result.saveTransaction;

                        // Create UserSubject entry for multi-student courses too
                        const checkUserSubject = await prisma.userSubject.findUnique({
                            where: {
                                studentId_subjectId: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                },
                            },
                        });

                        if (!checkUserSubject) {
                            await prisma.userSubject.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                },
                            });
                        }
                    } else if (courseType === 'SINGLE_PACKAGE') {
                        // Handle single-package: one booking per topic with student-chosen date/time
                        const topicSlotsRaw = chargeSucceeded.metadata.topicSlots;
                        if (!topicSlotsRaw) {
                            throw new Error('SINGLE_PACKAGE payment missing topicSlots in metadata');
                        }
                        let topicSlotsParsed;
                        try {
                            topicSlotsParsed = JSON.parse(topicSlotsRaw);
                        } catch (e) {
                            throw new Error('Invalid topicSlots in metadata');
                        }
                        if (!Array.isArray(topicSlotsParsed) || topicSlotsParsed.length === 0) {
                            throw new Error('topicSlots must be a non-empty array');
                        }

                        const subjectWithTopics = await prisma.subject.findUnique({
                            where: { id: chargeSucceeded.metadata.subjectId },
                            include: { subjectTopics: { orderBy: { orderIndex: 'asc' } } },
                        });
                        if (!subjectWithTopics || subjectWithTopics.courseType !== 'SINGLE_PACKAGE') {
                            throw new Error('Subject is not a single-package course');
                        }
                        const topicIds = new Set(subjectWithTopics.subjectTopics.map((t) => t.id));
                        const topicMap = new Map(subjectWithTopics.subjectTopics.map((t) => [t.id, t]));
                        for (const slot of topicSlotsParsed) {
                            if (!slot.subjectTopicId || !topicIds.has(slot.subjectTopicId)) {
                                throw new Error('Invalid subjectTopicId in topicSlots');
                            }
                            if (!slot.date || !slot.time) {
                                throw new Error('Each topic slot must have date and time');
                            }
                        }

                        // Create one Zoom meeting per topic and one booking per topic
                        const bookingsToCreate = [];
                        for (const slot of topicSlotsParsed) {
                            const topic = topicMap.get(slot.subjectTopicId);
                            const startTime = new Date(`${slot.date}T${slot.time}:00`);
                            const meeting = await createZoomMeeting(
                                chargeSucceeded.metadata.teacherEmail,
                                `${chargeSucceeded.metadata.subjectName} - ${topic.topicTitle}`,
                                startTime,
                                topic.hours * 60
                            );
                            bookingsToCreate.push({
                                subjectTopicId: topic.id,
                                bookingDate: startTime,
                                bookingTime: slot.time,
                                bookingHours: topic.hours,
                                meeting,
                            });
                        }

                        const amountPerBooking = Math.floor(chargeSucceeded.amount / bookingsToCreate.length);
                        const singlePackageResult = await prisma.$transaction(async (tx) => {
                            let firstBooking = null;
                            for (const b of bookingsToCreate) {
                                const created = await tx.booking.create({
                                    data: {
                                        subjectId: chargeSucceeded.metadata.subjectId,
                                        teacherId: teacherProfileId,
                                        studentId: studentProfileId,
                                        subjectTopicId: b.subjectTopicId,
                                        bookingDate: b.bookingDate,
                                        bookingTime: b.bookingTime,
                                        bookingStatus: BookingStatus.CONFIRMED,
                                        bookingPrice: amountPerBooking,
                                        bookingPaymentCompleted: true,
                                        bookingZoomUrl: b.meeting.join_url,
                                        bookingZoomPassword: b.meeting.password,
                                        bookingZoomId: b.meeting.id,
                                        bookingHours: b.bookingHours,
                                        bookingMinutes: b.bookingHours * 60,
                                    },
                                });
                                if (!firstBooking) firstBooking = created;
                            }
                            const saveTransaction = await tx.stripePurchases.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                    purchaseStatus: BookingStatus.CONFIRMED,
                                    purchaseAmount: chargeSucceeded.amount,
                                    purchaseCurrency: chargeSucceeded.currency,
                                    stripeCustomerId: chargeSucceeded.customer,
                                    purchaseReceiptUrl: chargeSucceeded.receipt_url,
                                    bookingId: firstBooking.id,
                                },
                            });
                            return { saveTransaction, firstBooking };
                        });
                        saveTransaction = singlePackageResult.saveTransaction;
                        createBooking = singlePackageResult.firstBooking;

                        const checkUserSubjectPkg = await prisma.userSubject.findUnique({
                            where: {
                                studentId_subjectId: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                },
                            },
                        });
                        if (!checkUserSubjectPkg) {
                            await prisma.userSubject.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                },
                            });
                        }
                    } else {
                        // Handle single-student course booking (existing flow)
                        // create meeting for teacher
                        const meeting = await createZoomMeeting(chargeSucceeded.metadata.teacherEmail, chargeSucceeded.metadata.subjectName, new Date(chargeSucceeded.metadata.date), parseInt(chargeSucceeded.metadata.subjectDuration) * 60);
                        
                    
                        const singleStudentResult = await prisma.$transaction(async (tx) => {
                            // Create booking first
                            const newBooking = await tx.booking.create({
                                data: {
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                    teacherId: teacherProfileId,
                                    studentId: studentProfileId,
                                    bookingDate: new Date(chargeSucceeded.metadata.date),
                                    bookingTime: chargeSucceeded.metadata.time,
                                    bookingStatus: BookingStatus.CONFIRMED,
                                    bookingPrice: chargeSucceeded.amount,
                                    bookingPaymentCompleted: true,
                                    bookingZoomUrl: meeting.join_url,
                                    bookingZoomPassword: meeting.password,
                                    bookingZoomId: meeting.id,
                                    bookingHours: parseInt(chargeSucceeded.metadata.subjectDuration),
                                    bookingMinutes: (chargeSucceeded.metadata.subjectDuration) * 60
                                }
                            });

                            // Create stripe purchase with booking reference
                            const saveTransaction = await tx.stripePurchases.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId,
                                    purchaseStatus: BookingStatus.CONFIRMED,
                                    purchaseAmount: chargeSucceeded.amount,
                                    purchaseCurrency: chargeSucceeded.currency,
                                    stripeCustomerId: chargeSucceeded.customer,
                                    purchaseReceiptUrl: chargeSucceeded.receipt_url,
                                    bookingId: newBooking.id // Link to the booking
                                }
                            });

                            return { saveTransaction, createBooking: newBooking };
                        });
                        saveTransaction = singleStudentResult.saveTransaction;
                        createBooking = singleStudentResult.createBooking;

                        const checkUserSubject = await prisma.userSubject.findUnique({
                            where: {
                                studentId_subjectId: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId
                                }
                            }
                        });
                        
                        if (!checkUserSubject) {
                            await prisma.userSubject.create({
                                data: {
                                    studentId: studentProfileId,
                                    subjectId: chargeSucceeded.metadata.subjectId
                                }
                            });
                        }
                    }

                const checkUserSubject = await prisma.userSubject.findUnique({
                    where: {
                       studentId_subjectId: {
                        studentId: studentProfileId,
                        subjectId: chargeSucceeded.metadata.subjectId
                       }
                    }
                })
                if(!checkUserSubject){
                    await prisma.userSubject.create({
                        data: {
                            studentId: studentProfileId,
                            subjectId: chargeSucceeded.metadata.subjectId
                        }
                    })
                }

                try {
                    await resend.emails.send({
                        from: process.env.COACH_ACADEM_RESEND_EMAIL,
                        to: chargeSucceeded.metadata.userEmail,
                        subject: 'Course Booking Success',
                        html: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                            <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                                    <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                                    <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                                </div>
                                <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Booking Confirmed!</h1>
                            </div>

                            <div style="padding: 40px 20px; background-color: #ffffff;">
                                <p style="font-size: 18px; font-weight: 500; color: #1A2B4B;">Hey,</p>

                                <p style="font-size: 16px; line-height: 1.6; color: #64748B;">Your booking has been successfully confirmed. We're excited to have you join us!</p>

                                <div style="background-color: #F8FAFC; padding: 30px; margin: 30px 0; position: relative; border-left: 4px solid #1A2B4B;">
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Booking ID</span><span style="color: #64748B; font-weight: 500;"> ${(courseType === 'MULTI_STUDENT' || courseType === 'MULTI_PACKAGE') ? saveTransaction.courseEnrollmentId : (createBooking?.id ?? '')}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Course</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.subjectName}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Date</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.date}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Time</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.time}</span></div>
                                    <div style="margin: 15px 0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Amount Paid</span><span style="color: #64748B; font-weight: 500;"> AED${(chargeSucceeded.amount / 100).toFixed(2)}</span></div>
                                </div>

                                <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
                                    <h3 style="color: #1A2B4B; font-size: 18px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">Important Reminders</h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #64748B;">
                                        <li>Join the class 5 minutes before the scheduled time</li>
                                        <li>Have your materials ready</li>
                                        <li>Test your audio and video before the session</li>
                                    </ul>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="coachacadem://bookings" style="background-color: #1A2B4B; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Open the app to view your class details and join link</a>
                                </div>

                                <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                                    <p style="color: #64748B; font-size: 14px; margin: 0 0 10px;">Thank you for choosing our platform!</p>
                                    <p style="color: #1A2B4B; font-size: 16px; font-weight: 700; margin: 0;">If you have any questions, please don't hesitate to contact us.</p>
                                </div>
                            </div>
                        </div>
                        `
                    });
                } catch (emailError) {
                    console.error('Error sending booking confirmation email to student via Resend:', emailError);
                }

                try {
                    await resend.emails.send({
                        from: process.env.COACH_ACADEM_RESEND_EMAIL,
                        to: chargeSucceeded.metadata.teacherEmail,
                        subject: 'You have a new booking',
                        html: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
                            <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                                    <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                                    <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
                                </div>
                                <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">New Booking!</h1>
                            </div>

                            <div style="padding: 40px 20px; background-color: #ffffff;">
                                <p style="font-size: 18px; font-weight: 500; color: #1A2B4B;">Hey,</p>

                                <p style="font-size: 16px; line-height: 1.6; color: #64748B;">You have received a new booking! A student has booked your class.</p>

                                <div style="background-color: #F8FAFC; padding: 30px; margin: 30px 0; position: relative; border-left: 4px solid #1A2B4B;">
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Booking ID</span><span style="color: #64748B; font-weight: 500;"> ${(courseType === 'MULTI_STUDENT' || courseType === 'MULTI_PACKAGE') ? saveTransaction.courseEnrollmentId : (createBooking?.id ?? '')}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Subject</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.subjectName}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Date & Time</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.date} ${chargeSucceeded.metadata.time}</span></div>
                                    <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Duration</span><span style="color: #64748B; font-weight: 500;"> ${chargeSucceeded.metadata.subjectDuration} hours</span></div>
                                    <div style="margin: 15px 0;"><span style="font-weight: 700; color: #1A2B4B; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Amount</span><span style="color: #64748B; font-weight: 500;"> AED${(chargeSucceeded.amount / 100).toFixed(2)}</span></div>
                                </div>

                                <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
                                    <h3 style="color: #1A2B4B; font-size: 18px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 1px;">Important Reminders</h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #64748B;">
                                        <li>Join the class 5 minutes before the scheduled time</li>
                                        <li>Prepare your teaching materials in advance</li>
                                        <li>Test your audio and video before the session</li>
                                        <li>Ensure you have a stable internet connection</li>
                                    </ul>
                                </div>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="coachacadem://bookings" style="background-color: #1A2B4B; color: #ffffff; padding: 15px 40px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Open the app to view this booking and Zoom link</a>
                                </div>

                                <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                                    <p style="color: #64748B; font-size: 14px; margin: 0 0 10px;">Thank you for being part of our teaching community!</p>
                                    <p style="color: #1A2B4B; font-size: 16px; font-weight: 700; margin: 0;">If you need any assistance, please don't hesitate to contact us.</p>
                                </div>
                            </div>
                        </div>
                        `
                    });
                } catch (emailError) {
                    console.error('Error sending new booking email to teacher via Resend:', emailError);
                }                
                         
                console.log('saveTransaction', saveTransaction)
                console.log('createBooking', createBooking);
            }

                break;
                case 'charge.updated':
                    const chargeUpdated = event.data.object;
                    // console.log('Charge Updated',chargeUpdated);
                    // Then define and call a function to handle the event charge.succeeded
                    break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}
