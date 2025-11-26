import { BookingStatus, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { createZoomMeeting, createZoomAccountForTeacher } from "../services/zoomService.js";
dotenv.config();
import Stripe from 'stripe';
import { sendEmailService } from "../services/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
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
        const { amount, currency = 'aed', customerId, teacherId, subjectId, date, time, subjectDuration, teacherEmail, subjectName, userEmail } = req.body;
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
        if (subject.subjectPrice !== amount) {
            return res.status(400).json({
                error: 'Invalid amount. Price of the subject is not same as amount.'
            });
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
                date,
                time,
                subjectDuration,
                teacherEmail,
                subjectName,
                userEmail
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
                            select: { 
                                id: true, 
                                email: true, 
                                name: true, 
                                zoomAccountCreated: true 
                            }
                        });

                        if (teacher && !teacher.zoomAccountCreated) {
                            console.log('First purchase detected. Creating Zoom account for teacher:', teacher.email);
                            
                            try {
                                await createZoomAccountForTeacher(teacher.email, teacher.name);
                                
                                // Update teacher's zoomAccountCreated flag
                                await prisma.user.update({
                                    where: { id: teacher.id },
                                    data: { zoomAccountCreated: true }
                                });
                                
                                console.log('Zoom account created successfully for teacher:', teacher.email);
                            } catch (zoomError) {
                                console.error('Failed to create Zoom account after retries:', zoomError);
                                
                                // Send error email to admin
                                const errorEmailHtml = `
                                    <html>
                                    <head>
                                        <meta charset="UTF-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <style>
                                            body {
                                                font-family: 'Helvetica Neue', Arial, sans-serif;
                                                line-height: 1.6;
                                                margin: 0;
                                                padding: 0;
                                                background-color: #f5f5f5;
                                            }
                                            .container {
                                                max-width: 600px;
                                                margin: 0 auto;
                                                padding: 0;
                                                background-color: #ffffff;
                                                border: 2px solid #000;
                                            }
                                            .header {
                                                background-color: #FF0000;
                                                color: white;
                                                padding: 40px 20px;
                                                text-align: center;
                                            }
                                            .header h1 {
                                                margin: 0;
                                                font-size: 32px;
                                                font-weight: 900;
                                                text-transform: uppercase;
                                                letter-spacing: 3px;
                                            }
                                            .content {
                                                padding: 30px;
                                                background-color: #ffffff;
                                            }
                                            .error-box {
                                                background-color: #fff3cd;
                                                border: 2px solid #ffc107;
                                                padding: 20px;
                                                margin: 20px 0;
                                            }
                                            .error-box h3 {
                                                margin: 0 0 15px 0;
                                                color: #856404;
                                                text-transform: uppercase;
                                            }
                                            .detail-row {
                                                margin: 10px 0;
                                                padding: 10px 0;
                                                border-bottom: 1px solid #ddd;
                                            }
                                            .detail-label {
                                                font-weight: 700;
                                                color: #000;
                                                text-transform: uppercase;
                                                font-size: 12px;
                                                letter-spacing: 1px;
                                            }
                                            .detail-value {
                                                color: #333;
                                                margin-top: 5px;
                                            }
                                            .footer {
                                                text-align: center;
                                                padding: 30px;
                                                background-color: #000;
                                                color: white;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="container">
                                            <div class="header">
                                                <h1>Zoom Account Creation Failed</h1>
                                            </div>
                                            <div class="content">
                                                <p style="font-size: 18px; font-weight: 500;">Admin Alert,</p>
                                                <p style="font-size: 16px;">A Zoom account creation failed for a teacher after automatic retries.</p>
                                                
                                                <div class="error-box">
                                                    <h3>⚠️ Error Details</h3>
                                                    <div class="detail-row">
                                                        <div class="detail-label">Teacher Name</div>
                                                        <div class="detail-value">${teacher.name}</div>
                                                    </div>
                                                    <div class="detail-row">
                                                        <div class="detail-label">Teacher Email</div>
                                                        <div class="detail-value">${teacher.email}</div>
                                                    </div>
                                                    <div class="detail-row">
                                                        <div class="detail-label">Subject ID</div>
                                                        <div class="detail-value">${chargeSucceeded.metadata.subjectId}</div>
                                                    </div>
                                                    <div class="detail-row">
                                                        <div class="detail-label">Subject Name</div>
                                                        <div class="detail-value">${chargeSucceeded.metadata.subjectName}</div>
                                                    </div>
                                                    <div class="detail-row">
                                                        <div class="detail-label">Error Message</div>
                                                        <div class="detail-value">${zoomError.message || zoomError.response?.data?.message || 'Unknown error'}</div>
                                                    </div>
                                                    <div class="detail-row" style="border-bottom: none;">
                                                        <div class="detail-label">Error Details</div>
                                                        <div class="detail-value">${JSON.stringify(zoomError.response?.data || zoomError.stack || 'No additional details')}</div>
                                                    </div>
                                                    <div class="detail-row" style="border-bottom: none;">
                                                        <div class="detail-label">Timestamp</div>
                                                        <div class="detail-value">${new Date().toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                
                                                <p style="font-size: 16px; margin-top: 20px;">
                                                    <strong>Action Required:</strong> Please manually create a Zoom account for this teacher and assign a Pro license. 
                                                    The booking has been created successfully, but the teacher will need a Zoom account to host meetings.
                                                </p>
                                            </div>
                                            <div class="footer">
                                                <p style="margin: 0; font-weight: 500;">Coach Academ System</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                `;

                                try {
                                    await sendEmailService(
                                        process.env.COACH_ACADEM_RESEND_EMAIL,
                                        'Zoom Account Creation Failed - Action Required',
                                        errorEmailHtml
                                    );
                                    console.log('Admin notification email sent successfully');
                                } catch (emailError) {
                                    console.error('Failed to send admin notification email:', emailError);
                                }
                            }
                        }
                    }
                    
                const zoomCreateMeetingResponse = await createZoomMeeting(chargeSucceeded.metadata.teacherEmail, chargeSucceeded.metadata.subjectName, uaeDate, (chargeSucceeded.metadata.subjectDuration) * 60 )
                console.log('zoomCreateMeetingResponse', zoomCreateMeetingResponse);

              
                
                const { saveTransaction, createBooking } = await prisma.$transaction(async (tx) => {
                    // Create booking first
                    const createBooking = await tx.booking.create({
                        data: {
                            subjectId: chargeSucceeded.metadata.subjectId,
                            teacherId: chargeSucceeded.metadata.teacherId,
                            studentId: chargeSucceeded.metadata.userId,
                            bookingDate: new Date(chargeSucceeded.metadata.date),
                            bookingTime: chargeSucceeded.metadata.time,
                            bookingStatus: BookingStatus.CONFIRMED,
                            bookingPrice: chargeSucceeded.amount,
                            bookingPaymentCompleted: true,
                            bookingZoomUrl: zoomCreateMeetingResponse.join_url,
                            bookingZoomPassword: zoomCreateMeetingResponse.password,
                            bookingHours: parseInt(chargeSucceeded.metadata.subjectDuration),
                            bookingMinutes: (chargeSucceeded.metadata.subjectDuration) * 60,
                            bookingZoomId: zoomCreateMeetingResponse.id
                        }
                    });

                    // Create stripe purchase with booking reference
                    const saveTransaction = await tx.stripePurchases.create({
                        data: {
                            userId: chargeSucceeded.metadata.userId,
                            subjectId: chargeSucceeded.metadata.subjectId,
                            purchaseStatus: BookingStatus.CONFIRMED,
                            purchaseAmount: chargeSucceeded.amount,
                            purchaseCurrency: chargeSucceeded.currency,
                            stripeCustomerId: chargeSucceeded.customer,
                            purchaseReceiptUrl: chargeSucceeded.receipt_url,
                            bookingId: createBooking.id // Link to the booking
                        }
                    });

                    const saveSubject = await tx.userSubject

                    return { saveTransaction, createBooking };
                });

                const checkUserSubject = await prisma.userSubject.findUnique({
                    where: {
                       userId_subjectId: {
                        userId: chargeSucceeded.metadata.userId,
                        subjectId: chargeSucceeded.metadata.subjectId
                       }
                    }
                })
                if(!checkUserSubject){
                    await prisma.userSubject.create({
                        data: {
                            userId: chargeSucceeded.metadata.userId,
                            subjectId: chargeSucceeded.metadata.subjectId
                        }
                    })
                }

                sendEmailService(chargeSucceeded.metadata.userEmail, 'Course Booking Success', `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #1A4C6E;
                            border: 2px solid #000;
                        }
                        .header {
                            background-color: #1A4C6E;
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .header::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .header::after {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 3px;
                            position: relative;
                            z-index: 1;
                        }
                        .content {
                            padding: 30px;
                            background-color: #1A4C6E;
                        }
                        .booking-details {
                            background-color: #1A4C6E;
                            padding: 25px;
                            margin: 25px 0;
                            border: 2px solid #000;
                            position: relative;
                        }
                        .booking-details::before {
                            content: '';
                            position: absolute;
                            top: -10px;
                            left: -10px;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                            z-index: 1;
                        }
                        .booking-details::after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            right: -10px;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                            z-index: 1;
                        }
                        .detail-row {
                            margin: 15px 0;
                            display: flex;
                            justify-content: space-between;
                            border-bottom: 1px solid #ddd;
                            padding-bottom: 10px;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 800;
                            color: #000;
                            text-transform: uppercase;
                            font-size: 14px;
                            letter-spacing: 1px;
                        }
                        .detail-value {
                            color: #333;
                            font-weight: 500;
                        }
                        .footer {
                            text-align: center;
                            padding: 30px;
                            background-color: #1A4C6E;
                            color: white;
                            position: relative;
                        }
                        .footer::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #1A4C6E 33%, #1A4C6E 33%, #1A4C6E 66%, #1A4C6E 66%);
                        }
                        .geometric-shape {
                            width: 100%;
                            height: 30px;
                            background: 
                                linear-gradient(45deg, #1A4C6E 25%, transparent 25%),
                                linear-gradient(-45deg, #1A4C6E 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, #1A4C6E 75%),
                                linear-gradient(-45deg, transparent 75%, #1A4C6E 75%);
                            background-size: 30px 30px;
                            background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
                            margin: 30px 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 40px;
                            background-color: #000;
                            color: white;
                            text-decoration: none;
                            text-transform: uppercase;
                            font-weight: 800;
                            letter-spacing: 2px;
                            margin: 20px 0;
                            border: 2px solid #000;
                            transition: all 0.3s ease;
                        }
                        .button:hover {
                            background-color: #1A4C6E;
                            border-color: #1A4C6E;
                        }
                        .reminder-box {
                            border: 2px solid #000;
                            padding: 20px;
                            margin: 25px 0;
                            position: relative;
                        }
                        .reminder-box h3 {
                            margin: 0 0 15px 0;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #000;
                        }
                        .reminder-box ul {
                            margin: 0;
                            padding-left: 20px;
                        }
                        .reminder-box li {
                            margin: 10px 0;
                            color: #333;
                        }
                        .geometric-corner {
                            position: absolute;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .corner-tl { top: -10px; left: -10px; }
                        .corner-tr { top: -10px; right: -10px; }
                        .corner-bl { bottom: -10px; left: -10px; }
                        .corner-br { bottom: -10px; right: -10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Confirmed!</h1>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px; font-weight: 500;">Hey,</p>
                            
                            <p style="font-size: 16px;">Your booking has been successfully confirmed. We're excited to have you join us!</p>
                            
                            <div class="geometric-shape"></div>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID</span>
                                    <span class="detail-value"> ${createBooking.id}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Course</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.subjectName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.date}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Time</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.time}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount Paid</span>
                                    <span class="detail-value"> AED${(chargeSucceeded.amount / 100).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="reminder-box">
                                <div class="geometric-corner corner-tl"></div>
                                <div class="geometric-corner corner-tr"></div>
                                <div class="geometric-corner corner-bl"></div>
                                <div class="geometric-corner corner-br"></div>
                                <h3>Important Reminders</h3>
                                <ul>
                                    <li>Join the class 5 minutes before the scheduled time</li>
                                    <li>Have your materials ready</li>
                                    <li>Test your audio and video before the session</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href=" ${createBooking.bookingZoomUrl}" class="button">Join the class during the scheduled time using the link below or on the app</a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p style="margin: 0; font-weight: 500;">Thank you for choosing our platform!</p>
                            <p style="margin: 10px 0 0 0;">If you have any questions, please don't hesitate to contact us.</p>
                        </div>
                    </div>
                </body>
                </html>
                `);     
                
                
                sendEmailService(chargeSucceeded.metadata.teacherEmail, 'You have a new booking', `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #1A4C6E;
                            border: 2px solid #000;
                        }
                        .header {
                            background-color: #1A4C6E;
                            color: white;
                            padding: 40px 20px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .header::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .header::after {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 3px;
                            position: relative;
                            z-index: 1;
                        }
                        .content {
                            padding: 30px;
                            background-color: #1A4C6E;
                        }
                        .booking-details {
                            background-color: #1A4C6E;
                            padding: 25px;
                            margin: 25px 0;
                            border: 2px solid #000;
                            position: relative;
                        }
                        .booking-details::before {
                            content: '';
                            position: absolute;
                            top: -10px;
                            left: -10px;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                            z-index: 1;
                        }
                        .booking-details::after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            right: -10px;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                            z-index: 1;
                        }
                        .detail-row {
                            margin: 15px 0;
                            display: flex;
                            justify-content: space-between;
                            border-bottom: 1px solid #ddd;
                            padding-bottom: 10px;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 800;
                            color: #000;
                            text-transform: uppercase;
                            font-size: 14px;
                            letter-spacing: 1px;
                        }
                        .detail-value {
                            color: #333;
                            font-weight: 500;
                        }
                        .footer {
                            text-align: center;
                            padding: 30px;
                            background-color: #1A4C6E;
                            color: white;
                            position: relative;
                        }
                        .footer::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #1A4C6E 33%, #1A4C6E 33%, #1A4C6E 66%, #1A4C6E 66%);
                        }
                        .geometric-shape {
                            width: 100%;
                            height: 30px;
                            background: 
                                linear-gradient(45deg, #1A4C6E 25%, transparent 25%),
                                linear-gradient(-45deg, #1A4C6E 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, #1A4C6E 75%),
                                linear-gradient(-45deg, transparent 75%, #1A4C6E 75%);
                            background-size: 30px 30px;
                            background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
                            margin: 30px 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 40px;
                            background-color: #1A4C6E;
                            color: white;
                            text-decoration: none;
                            text-transform: uppercase;
                            font-weight: 800;
                            letter-spacing: 2px;
                            margin: 20px 0;
                            border: 2px solid #000;
                            transition: all 0.3s ease;
                        }
                        .button:hover {
                            background-color: #1A4C6E;
                            border-color: #1A4C6E;
                        }
                        .reminder-box {
                            border: 2px solid #000;
                            padding: 20px;
                            margin: 25px 0;
                            position: relative;
                        }
                        .reminder-box h3 {
                            margin: 0 0 15px 0;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #000;
                        }
                        .reminder-box ul {
                            margin: 0;
                            padding-left: 20px;
                        }
                        .reminder-box li {
                            margin: 10px 0;
                            color: #333;
                        }
                        .geometric-corner {
                            position: absolute;
                            width: 20px;
                            height: 20px;
                            background: #1A4C6E;
                        }
                        .corner-tl { top: -10px; left: -10px; }
                        .corner-tr { top: -10px; right: -10px; }
                        .corner-bl { bottom: -10px; left: -10px; }
                        .corner-br { bottom: -10px; right: -10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Booking!</h1>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px; font-weight: 500;">Hey,</p>
                            
                            <p style="font-size: 16px;">You have received a new booking! A student has booked your class.</p>
                            
                            <div class="geometric-shape"></div>
                            
                            <div class="booking-details">
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID</span>
                                    <span class="detail-value"> ${createBooking.id}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Subject</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.subjectName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date & Time</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.date} ${chargeSucceeded.metadata.time}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Duration</span>
                                    <span class="detail-value"> ${chargeSucceeded.metadata.subjectDuration} hours</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Amount</span>
                                    <span class="detail-value"> AED${(chargeSucceeded.amount / 100).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="reminder-box">
                                <div class="geometric-corner corner-tl"></div>
                                <div class="geometric-corner corner-tr"></div>
                                <div class="geometric-corner corner-bl"></div>
                                <div class="geometric-corner corner-br"></div>
                                <h3>Important Reminders</h3>
                                <ul>
                                    <li>Join the class 5 minutes before the scheduled time</li>
                                    <li>Prepare your teaching materials in advance</li>
                                    <li>Test your audio and video before the session</li>
                                    <li>Ensure you have a stable internet connection</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${createBooking.bookingZoomUrl}" class="button">Join Class</a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p style="margin: 0; font-weight: 500;">Thank you for being part of our teaching community!</p>
                            <p style="margin: 10px 0 0 0;">If you need any assistance, please don't hesitate to contact us.</p>
                        </div>
                    </div>
                </body>
                </html>
                `);                
                         
                console.log('saveTransaction', saveTransaction);
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
