import crypto from "crypto";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();
import { sendEmailService } from "../services/emailService.js";


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
        sendVerificationEmail(newUser.email, verificationToken, name, isTeacher);

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
const sendVerificationEmail = async (email, verificationToken, name, isTeacher) => {

    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
        auth: {
            user: process.env.NAMECHEAP_EMAIL,
            pass: process.env.NAMECHEAP_EMAIL_PASSWORD
        }
    })

    const welcomeMessage = isTeacher 
        ? "Welcome to Coach Academ! We're excited to have you join our community of educators. As a teacher, you'll be able to share your expertise and help students achieve their academic goals."
        : "Welcome to Coach Academ! We're thrilled to have you join our community of learners. As a student, you'll have access to expert teachers and comprehensive learning resources.";

    const mailOptions = {
      from: process.env.NAMECHEAP_EMAIL,
      to: email,
      subject: 'Verify Your Account – Action Required',
      html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
        <!-- Bauhaus-style header with primary colors -->
        <div style="display: flex; margin-bottom: 20px;">
          <div style="width: 20%; background-color: #FF0000;"></div>
          <div style="width: 60%; background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">VERIFY</h1>
          </div>
          <div style="width: 20%; background-color: #FFD700;"></div>
        </div>
        
        <div style="padding: 30px; color: #000000;">
          <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700;">Hello <strong>${name}</strong>,</p>
          
          <!-- Geometric highlight box -->
          <div style="background-color: #f5f5f5; padding: 25px; margin: 25px 0; border-left: 8px solid #FF0000;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; font-weight: 500;">${welcomeMessage}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">To complete your registration, please verify your account by clicking the button below:</p>
          
          <!-- Bauhaus-style button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://studentmobilern-31oo.onrender.com/api/auth/verify/${verificationToken}" 
               style="background-color: #000000; color: #ffffff; padding: 20px 40px; text-decoration: none; font-weight: 900; display: inline-block; border: 3px solid #000000; text-transform: uppercase; letter-spacing: 2px;">
              VERIFY NOW
            </a>
          </div>
          
          <!-- Geometric separator -->
          <div style="display: flex; margin: 30px 0;">
            <div style="width: 30%; height: 3px; background-color: #FF0000;"></div>
            <div style="width: 40%; height: 3px; background-color: #000000;"></div>
            <div style="width: 30%; height: 3px; background-color: #FFD700;"></div>
          </div>
          
          <p style="font-size: 14px; color: #666666; margin: 0; font-weight: 500;">If you didn't sign up for this account, please ignore this email.</p>
        </div>
        
        <!-- Bauhaus-style footer -->
        <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">Best regards,<br>The Coach Academ Team</p>
        </div>
      </div>
      `,
      text: `
      Hi ${name},

      ${welcomeMessage}

      To complete your registration, please verify your account by clicking the link below:

      https://studentmobilern-31oo.onrender.com/api/auth/verify/${verificationToken}

      If you didn't sign up for this account, please ignore this email.

      Best regards,
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
        return res.status(400).send(`
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; background-color: #ffffff;">
            <div style="display: flex; margin-bottom: 20px;">
              <div style="width: 20%; background-color: #FF0000;"></div>
              <div style="width: 60%; background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Error</h1>
              </div>
              <div style="width: 20%; background-color: #FFD700;"></div>
            </div>
            <div style="padding: 30px; text-align: center;">
              <p style="font-size: 20px; color: #FF0000; font-weight: 700;">Invalid verification token</p>
              <p style="font-size: 16px; margin-top: 20px;">Please check your email for the correct verification link.</p>
            </div>
          </div>
        `);
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
  
      // Send HTML success page
      res.status(202).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verified - Coach Academ</title>
          <style>
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .success-icon {
              animation: fadeIn 0.5s ease-out;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Bauhaus-style header -->
            <div style="display: flex; margin-bottom: 20px;">
              <div style="width: 20%; background-color: #FF0000;"></div>
              <div style="width: 60%; background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Verified</h1>
              </div>
              <div style="width: 20%; background-color: #FFD700;"></div>
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
              <!-- Success Icon -->
              <div class="success-icon" style="width: 80px; height: 80px; margin: 0 auto 30px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #000000;">Account Successfully Verified!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 30px;">
                Welcome to Coach Academ! Your account has been verified and you can now access all features.
              </p>
              
              <!-- Geometric separator -->
              <div style="display: flex; margin: 30px auto; max-width: 200px;">
                <div style="width: 30%; height: 3px; background-color: #FF0000;"></div>
                <div style="width: 40%; height: 3px; background-color: #000000;"></div>
                <div style="width: 30%; height: 3px; background-color: #FFD700;"></div>
              </div>
              
              // <a href="https://studentmobilern-31oo.onrender.com/login" 
              //    style="background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
              //   Proceed to Login
              // </a>
            </div>
            
            <!-- Bauhaus-style footer -->
            <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">Coach Academ Team</p>
            </div>
          </div>
        </body>
        </html>
      `);
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
      console.log(user, 'this is the user');
      
      res.status(200).json({
        message: "Login successful",
        token,
        isTeacher: user.isTeacher,
        isAdmin: user.isAdmin,
        userId: user.id,
        recommendedSubjects: user.recommendedSubjects,
        userProfileImage: user.profileImage,
        hasSeenOnboarding: user.hasSeenOnboarding,
        email: user.email,
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
          userSubjects: {
            include: {
              subject: {
                select: {
                  id: true,
                  subjectName: true,
                  subjectImage: true,
                  subjectBoard: true,
                  subjectGrade: true,
                  subjectPrice: true,
                }
              }
            }
          }
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

    if(currentPassword === newPassword){
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
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

    await sendEmailService(
        user.email,
        "Password Changed Successfully",
        `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
          <!-- Bauhaus-style header with primary colors -->
          <div style="display: flex; margin-bottom: 20px;">
            <div style="width: 20%; background-color: #FF0000;"></div>
            <div style="width: 60%; background-color: #000000; color: #ffffff; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Password Changed</h1>
            </div>
            <div style="width: 20%; background-color: #FFD700;"></div>
          </div>
          
          <div style="padding: 30px; color: #000000;">
            <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700;">Hello <strong>${user.name}</strong>,</p>
            
            <!-- Geometric highlight box -->
            <div style="background-color: #f5f5f5; padding: 25px; margin: 25px 0; border-left: 8px solid #FF0000;">
              <p style="margin: 0; font-size: 16px; line-height: 1.8; font-weight: 500;">Your password has been successfully changed at ${new Date().toLocaleString()} (GMT+4).</p>
            </div>
            
            <!-- Warning Box -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 20px; margin: 25px 0; border-left: 8px solid #FFD700;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">⚠️ Important Security Notice</h3>
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">If you did not make this change, please contact our security team immediately at <a href="mailto:support@coachacadem.ae" style="color: #856404; text-decoration: underline;">support@coachacadem.ae</a></p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">For your security, please note:</p>
            <ul style="font-size: 16px; line-height: 1.6; font-weight: 500;">
              <li>Your new password is now active</li>
              <li>All existing sessions have been logged out</li>
              <li>You will need to log in again with your new password</li>
            </ul>
            
            <!-- Geometric separator -->
            <div style="display: flex; margin: 30px 0;">
              <div style="width: 30%; height: 3px; background-color: #FF0000;"></div>
              <div style="width: 40%; height: 3px; background-color: #000000;"></div>
              <div style="width: 30%; height: 3px; background-color: #FFD700;"></div>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">Security Best Practices:</p>
            <ul style="font-size: 16px; line-height: 1.6; font-weight: 500;">
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Regularly update your password</li>
            </ul>
          </div>
          
          <!-- Bauhaus-style footer -->
          <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">This is an automated message, please do not reply to this email.</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; font-weight: 700; letter-spacing: 1px;">For support, contact: <a href="mailto:support@coachacadem.ae" style="color: #ffffff; text-decoration: underline;">support@coachacadem.ae</a></p>
          </div>
        </div>
        `
    );

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

export const getActiveStudentCourses = async (req, res, next) => {
const userId = req.userId;
console.log(userId, 'this is the user id');

try{
  const activeCourses = await prisma.userSubject.findMany({
    where: {
      userId: userId
    },
    include: {
      subject: true
    }
  })
  res.status(200).json(activeCourses);
}
catch(err){
  console.log('error in get active courses', err);
  
  next(err);
}
}

export const updateUserHasSeenOnboarding = async (req, res, next) => {
  const userId = req.body.userId;

  try{
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasSeenOnboarding: true },
    });
    res.status(200).json({ message: "User has seen onboarding", updatedUser });
  }
  catch(err){
    console.log('error in update user has seen onboarding', err);
    next(err);
  }
}