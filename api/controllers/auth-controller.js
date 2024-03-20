import User from "../models/user.js";
import crypto from "crypto";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res,next) => {
    try {
       
        const { name, email, password, profileImage, userDescription, isTeacher } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const hash = await bcrypt.hashSync(req.body.password, 5)

       
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });

        }
        const newUser = new User({
          ...req.body,
            password:hash
        });
        //generate the verification token
        newUser.verificationToken = crypto.randomBytes(20).toString('hex');


        const savedUser = await newUser.save();

        //send the verification email
        sendVerificationEmail(newUser.email, newUser.verificationToken, name);

        res.status(202).json({ message: "User Registered", verification_message: "Email has been sent, please verify", savedUser });
    }
    catch (err) {
       next(err);
    }
}

// not a route controller, function to send verification email
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

        Please click the link below to verify your account: https://studentmobilern.onrender.com/api/auth/verify/${verificationToken}`
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

export const verifyEmail = async (req, res,next) => {
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
       next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email,password } = req.body;
        
        const user =await User.findOne({ email});
       
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email" });
        }
        let isCorrect = bcrypt.compareSync(password, user.password)
        if (!isCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id, isTeacher:user.isTeacher,isAdmin:user.isAdmin }, process.env.SECRET_KEY);
        res.status(200).json({ message: "Login successful", token, isTeacher:user.isTeacher, isAdmin:user.isAdmin, userId:user._id });
    }
    catch (err) {
        console.log(err);
       next(err);
    }
}

export const singleUser = async (req, res,next) => {
    try {
        const user = await User.findById(req.userId).select('-password').populate('subjects');
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    }
    catch (err) {
        next(err);
    }
}