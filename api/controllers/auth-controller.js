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
      subject: 'Verify Your Account – Action Required',
      text: `
      Hi ${name},
  
      Welcome! We're excited to have you on board.
  
      To complete your registration, please verify your account by clicking the link below:
  
      🔗 https://studentmobilern-31oo.onrender.com/api/auth/verify/${verificationToken}
  
      If you didn't sign up for this account, please ignore this email.
  
      Best,  
      The Coach Academ Team
      `
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
        { userId: user.id, isTeacher: user.isTeacher, isAdmin: user.isAdmin, email: user.email },
        process.env.SECRET_KEY
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
        isTeacher: user.isTeacher,
        isAdmin: user.isAdmin,
        userId: user.id,
        recommendedSubjects: user.recommendedSubjects,
        userProfileImage: user.profileImage,
      });
    } catch (err) {
      console.error(err);
      next(err);
    } 
  };

  export const singleUser = async (req, res, next) => {
    try {
      const { userId } = req;
      console.log('first phase ');
      
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
          userDescription: true,
          // Populate related subjects
          subjects: true,
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      console.log(user, 'this is the user');
      
      console.log('second phase ');
      res.status(200).json(user);
    } catch (err) {
      next(err);
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

export const getTeacherProfile = async (req, res, next) => {
  try{
    const { teacherProfileId } = req.params;
    console.log(teacherProfileId, 'this is the teacher profile id');
    const teacherProfile = await prisma.user.findUnique({
      where: { id: teacherProfileId },
      select: {
        id: true,
        name: true,
        email: true,
        isTeacher: true,
        profileImage: true,
        userDescription: true,
        reccomendedSubjects: true,
        recommendedBoard: true,
        recommendedGrade: true,
        subjects: true,
      },
    });

    if (!teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    res.status(200).json(teacherProfile);
  }
  catch(err){
    next(err);
    }
}

export const updateMetadata = async (req, res, next) => {
  try{
    const userId = req.userId;
    const { name, email, userDescription } = req.body.body;
    console.log(userId, 'this is the user id');
    console.log(name, email, userDescription, 'this is the name, email, user description');
    

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
        userDescription: userDescription,
      },
    });

    console.log(updatedUser, 'this is the updated user');

    const token = jwt.sign(
      { userId: updatedUser.id, isTeacher: updatedUser.isTeacher, isAdmin: updatedUser.isAdmin, email: updatedUser.email },
      process.env.SECRET_KEY
    );

    res.status(200).json({ message: "Metadata updated", token });
  }
  catch(err){
    next(err);
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new password" });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify current password
    const isCorrect = bcrypt.compareSync(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hash = bcrypt.hashSync(newPassword, 5);

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    if (!password) {
      return res.status(400).json({ message: "Please provide your password" });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify password
    const isCorrect = bcrypt.compareSync(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Delete the user - all related records will be deleted automatically due to onDelete: Cascade
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error('Error deleting account:', err);
    next(err);
  }

};

export const verifyPurchase = async (req, res, next) => {
  const userId = req.userId;
  const { subjectId } = req.params;

  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required" });
  }

  try {
    const purchase = await prisma.stripePurchases.findFirst({
      where: {
        userId: userId,
        subjectId: subjectId,
        purchaseStatus: 'CONFIRMED'
      }
    });

    res.status(200).json({
      message: "Purchase verification completed",
      hasPurchased: !!purchase
    });
  }
  catch(err){
    console.log('error in verify purchase', err);
    next(err);
  }
}