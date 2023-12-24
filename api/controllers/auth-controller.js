import { send } from "process";
import User from "../models/user.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password, profileImage, userDescription, isTeacher } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });

        }
        const newUser = new User({
            name,
            email,
            password,
            profileImage,
            userDescription,
            isTeacher
        });
        //generate the verification token
        newUser.verificationToken = crypto.randomBytes(20).toString('hex');


        const savedUser = await newUser.save();

        //send the verification email
        sendVerificationEmail(newUser.email, newUser.verificationToken, name);

        res.status(202).json({ message: "User Registered", verification_message: "Email has been sent, please verify", savedUser });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
}

const sendVerificationEmail = async (email, verificationToken, name) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Verification',
        text: `
        Hi ${name},

        Please click the link below to verify your account: http://localhost:3000/api/auth/verify/${verificationToken}`
    }

    //send the mail
    try {
        const response = await transporter.sendMail(mailOptions);
        console.log("Verification email sent", response);
    }
    catch (err) {
        console.log("Err sending verification email", err);
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        const userToken = await User.findOne({ verificationToken: token });
        if (!userToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        userToken.verified = true;
        userToken.verificationToken = undefined;
        const savedUser = await userToken.save();
        res.status(202).json({ message: "Account verified", savedUser });

    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user =await User.findOne({ email, password });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token });
    }
    catch (err) {
        res.status(400).json({ message: err.message, error: "Login Failed" });
    }
}