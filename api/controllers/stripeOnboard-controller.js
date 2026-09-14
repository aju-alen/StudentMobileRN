import dotenv from "dotenv";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY,{
    apiVersion: "2023-10-16",
  });
dotenv.config();

export const onboardAccountCreate = async (req, res, next) => {
    try {
        const account = await stripe.accounts.create({});
    
        res.json({
          account: account.id,
        });
      } catch (error) {
        console.error(
          "An error occurred when calling the Stripe API to create an account",
          error
        );
        res.status(500).json({ error: 'Failed to create Stripe account' });
      }
}

export const linkOnboardAccount = async (req, res, next) => {
    try {
        const { account } = req.body;

        if (!account) {
          return res.status(400).json({ error: 'Account ID is required' });
        }
    
        const accountLink = await stripe.accountLinks.create({
          account: account,
          return_url: `${req.headers.origin}/return/${account}`,
          refresh_url: `${req.headers.origin}/refresh/${account}`,
          type: "account_onboarding",
        });
    
        res.json(accountLink);
      } catch (error) {
        console.error(
          "An error occurred when calling the Stripe API to create an account link:",
          error
        );
        res.status(500).json({ error: 'Failed to create Stripe account link' });
      }
}