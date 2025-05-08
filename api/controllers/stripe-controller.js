import { BookingStatus, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { createZoomMeeting } from "../services/zoomService.js";
dotenv.config();
import Stripe from 'stripe';
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
        const { amount, currency = 'aed', customerId, teacherId, subjectId, date, time, subjectDuration, teacherEmail, subjectName } = req.body;
        const userId = req.userId;
        
        
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
                subjectName
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

export const stripeWebhook = async (req, res, next) => {
    try {
        const event = req.body;

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
