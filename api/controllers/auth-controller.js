import User from "../models/user.js";
import crypto from "crypto";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const register = async (req, res,next) => {
    console.log('inside register route');
    try {
      
        const { name, email, password, profileImage, userDescription, isTeacher,reccomendedSubjects,recommendedBoard,recommendedGrade } = req.body;
        console.log(req.body, 'this is the req body');
        

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const hash = bcrypt.hashSync(password, 5);

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate the verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hash,
                profileImage,
                userDescription,
                isTeacher,
                verificationToken,
                reccomendedSubjects: reccomendedSubjects,
                recommendedBoard,
                recommendedGrade
            },
        });

        // Send the verification email
        sendVerificationEmail(newUser.email, verificationToken, name);

        res.status(202).json({
            message: "User Registered",
            verification_message: "Email has been sent, please verify",
            savedUser: newUser,
            userId: newUser.id,
        });
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

        Please click the link below to verify your account: https://studentmobilern-31oo.onrender.com/api/auth/verify/${verificationToken}`
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

export const verifyEmail = async (req, res, next) => {
    try {
      const token = req.params.token;
  
      // Find the user with the verification token
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid token" });
      }
  
      // Update the user to mark as verified and remove the verification token
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified: true,
          verificationToken: null,
        },
      });
  
      res.status(202).json({ message: "Account verified", updatedUser });
    } catch (err) {
      next(err);
    } finally {
      await prisma.$disconnect();
    }
  };

  export const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      if (!user.verified) {
        return res.status(400).json({ message: "Please verify your email" });
      }
  
      // Compare the provided password with the hashed password in the database
      const isCorrect = bcrypt.compareSync(password, user.password);
  
      if (!isCorrect) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.id, isTeacher: user.isTeacher, isAdmin: user.isAdmin },
        process.env.SECRET_KEY
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
        isTeacher: user.isTeacher,
        isAdmin: user.isAdmin,
        userId: user.id,
        recommendedSubjects: user.recommendedSubjects,
        text: "llllllllllllllllllllllllllllllllllllllllllllllll",
      });
    } catch (err) {
      console.error(err);
      next(err);
    } finally {
      await prisma.$disconnect();
    }
  };

  export const singleUser = async (req, res, next) => {
    try {
      const { userId } = req;
  
      // Find the user by ID and include related subjects
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          verified: true,
          isTeacher: true,
          isAdmin: true,
          reccomendedSubjects: true,
          profileImage: true,
          // Populate related subjects (assumes subjects is a relation)
          subjects: true,
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (err) {
      next(err);
    } finally {
      await prisma.$disconnect();
    }
  };

export const updateProfileImage = async (req, res, next) => {
    console.log(req.params, 'this is the upload image req in backend');
    console.log(req.body, 'this is the upload image req in backend');

    try {
        const { uploadImage: userId } = req.params;
        const { profileImage } = req.body;

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Update the user's profile image
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage },
        });

        res.status(200).json({ message: "Profile image updated", savedUser: updatedUser });
    } catch (err) {
        next(err);
    }
};