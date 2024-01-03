import dotenv from "dotenv";
import Subject from "../models/subjects.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
dotenv.config();

export const createPaymentIntent = async (req, res, next) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "aed",
            automatic_payment_methods: {
                enabled: true,
            }
        });
        res.json({ paymentIntent: paymentIntent.client_secret });

    }
    catch (err) {
        console.log(err);
        next(err);
    }


}