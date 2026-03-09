import crypto from "crypto";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
import { Resend } from 'resend';
dotenv.config();
import { sendEmailService } from "../services/emailService.js";
import { createZoomAccountForTeacher, deleteZoomUser } from "../services/zoomService.js";
const resend = new Resend(process.env.COACH_ACADEM_RESEND_API_KEY);


const prisma = new PrismaClient();

// Helper function to generate 8-character alphanumeric invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const registerSuperAdmin = async (req, res, next) => {
    try {
        const { name, email, password, profileImage, userDescription, role, permissions } = req.body;
        console.log(req.body, 'this is the req body');

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields" });
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

        // Create User with AdminProfile
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hash,
                profileImage: profileImage || null,
                userDescription: userDescription || "No description provided",
                userType: 'ADMIN',
                verificationToken,
                hasSeenOnboarding: false,
                adminProfile: {
                    create: {
                        role: role || 'SUPERADMIN',
                        permissions: permissions || [],
                    }
                }
            },
            include: {
                adminProfile: true
            }
        });

        res.status(202).json({
            message: "Super Admin Registered",
            savedUser: newUser,
            userId: newUser.id,
            adminProfile: newUser.adminProfile
        });
    }
    catch(err){
        console.error('Error registering super admin:', err);
        next(err);
    }
}

export const register = async (req, res, next) => {
    console.log('inside register route');
    try {
        const { 
            name, 
            email, 
            password, 
            profileImage, 
            userDescription, 
            userType,
            reccomendedSubjects,
            recommendedBoard,
            recommendedGrade,
            selectedGrades,
            // Organization fields
            organizationName,
            organizationEmail,
            organizationWebsite,
            tradeLicensePdf,
            teacherCount,
            organizationRole
        } = req.body;
        
        console.log(req.body, 'this is the req body');

        // Specific validation for required fields
        const missing = [];
        if (!name || (typeof name === 'string' && !name.trim())) missing.push('name');
        if (!email || (typeof email === 'string' && !email.trim())) missing.push('email');
        if (!password || (typeof password === 'string' && !password.trim())) missing.push('password');
        if (!userType) missing.push('account type');
        if (missing.length > 0) {
            const fieldList = missing.length === 1 ? missing[0] : missing.slice(0, -1).join(', ') + ' and ' + missing[missing.length - 1];
            return res.status(400).json({ message: `Please provide ${fieldList}` });
        }

        // Validate userType
        const validUserTypes = ['STUDENT', 'TEACHER', 'ADMIN', 'ORGANIZATION'];
        if (!validUserTypes.includes(userType.toUpperCase())) {
            return res.status(400).json({ message: "Invalid account type. Please choose Student, Teacher, or Organization." });
        }

        const hash = bcrypt.hashSync(password, 5);

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email address already exists. Please sign in or use a different email." });
        }

        // Generate the verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Map frontend userType to backend enum
        // 'student' -> 'STUDENT', 'teacher' -> 'TEACHER', 'organization' -> 'TEACHER' (organizations are teachers)
        let userTypeEnum;
        const isOrganization = userType === 'organization';
        
        if (userType === 'student') {
            userTypeEnum = 'STUDENT';
        } else if (userType === 'teacher' || userType === 'organization') {
            userTypeEnum = 'TEACHER'; // Organizations are teachers with special setup
        } else {
            return res.status(400).json({ message: "Invalid user type" });
        }

        // Create the new user with profile based on userType
        let newUser;
        let profile;

        if (userTypeEnum === 'STUDENT') {
            // Create User with StudentProfile
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                    profileImage,
                    userDescription,
                    userType: 'STUDENT',
                    verificationToken,
                    hasSeenOnboarding: false,
                    studentProfile: {
                        create: {
                            recommendedBoard: recommendedBoard || null,
                            recommendedGrade: recommendedGrade ? parseInt(recommendedGrade) : null,
                            reccomendedSubjects: reccomendedSubjects || [],
                        }
                    }
                },
                include: {
                    studentProfile: true
                }
            });
            profile = newUser.studentProfile;
        } 
        else if (userTypeEnum === 'TEACHER') {
            // Create User with TeacherProfile
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                    profileImage,
                    userDescription,
                    userType: 'TEACHER',
                    verificationToken,
                    hasSeenOnboarding: false,
                    teacherProfile: {
                        create: {
                            zoomAccountCreated: false,
                            zoomUserAcceptedInvite: false,
                            isTeamLead: false,
                        }
                    }
                },
                include: {
                    teacherProfile: true
                }
            });
            profile = newUser.teacherProfile;
        }
        else if (userTypeEnum === 'ADMIN') {
            // Create User with AdminProfile
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                    profileImage,
                    userDescription,
                    userType: 'ADMIN',
                    verificationToken,
                    hasSeenOnboarding: false,
                    adminProfile: {
                        create: {
                            role: 'SUPERADMIN',
                            permissions: [],
                        }
                    }
                },
                include: {
                    adminProfile: true
                }
            });
            profile = newUser.adminProfile;
        }

        // Handle Organization registration
        let organization = null;
        if (isOrganization) {
            // Validate organization fields
            const orgMissing = [];
            if (!organizationName || (typeof organizationName === 'string' && !organizationName.trim())) orgMissing.push('organization name');
            if (!organizationEmail || (typeof organizationEmail === 'string' && !organizationEmail.trim())) orgMissing.push('organization email');
            if (!organizationWebsite || (typeof organizationWebsite === 'string' && !organizationWebsite.trim())) orgMissing.push('organization website');
            if (orgMissing.length > 0) {
                await prisma.user.delete({ where: { id: newUser.id } });
                const fieldList = orgMissing.length === 1 ? orgMissing[0] : orgMissing.slice(0, -1).join(', ') + ' and ' + orgMissing[orgMissing.length - 1];
                return res.status(400).json({ message: `Organization registration requires ${fieldList}.` });
            }

            // Validate and normalize organization role (default OWNER for registrant)
            const validOrgRoles = ['OWNER', 'TEACHER', 'MANAGER'];
            const role = organizationRole && validOrgRoles.includes(String(organizationRole).toUpperCase())
                ? String(organizationRole).toUpperCase()
                : 'OWNER';

            // Update teacher profile to be team lead and set organization role
            await prisma.teacherProfile.update({
                where: { id: profile.id },
                data: { isTeamLead: true, organizationRole: role }
            });

            // Create Organization with teacher as team lead
            // Note: tradeLicensePdf will be uploaded after registration, so it's null initially
            organization = await prisma.organization.create({
                data: {
                    orgName: organizationName,
                    orgWebsite: organizationWebsite,
                    orgLicense: tradeLicensePdf || null, // Will be updated after PDF upload
                    orgCapacity: teacherCount ? parseInt(teacherCount) : 3,
                    teamLeadId: profile.id,
                }
            });

            // Update teacher profile to link to organization
            await prisma.teacherProfile.update({
                where: { id: profile.id },
                data: { organizationId: organization.id }
            });
        }

        // Send the verification email
        const isTeacher = userTypeEnum === 'TEACHER' || userTypeEnum === 'ADMIN';
        
        
        sendVerificationEmail(newUser.email, verificationToken, name, isTeacher);

        res.status(202).json({
            message: "User Registered",
            verification_message: "Email has been sent, please verify",
            savedUser: newUser,
            userId: newUser.id,
            userType: userTypeEnum,
            ...(organization && { organization })
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        next(err);
    }
}

// not a route controller, function to send verification email
const sendVerificationEmail = async (email, verificationToken, name, isTeacher) => {


    const welcomeMessage = isTeacher 
        ? "Welcome to Coach Academ! We're excited to have you join our community of educators. As a teacher, you'll be able to share your expertise and help students achieve their academic goals."
        : "Welcome to Coach Academ! We're thrilled to have you join our community of learners. As a student, you'll have access to expert teachers and comprehensive learning resources.";

    const mailOptions = {
      from: process.env.NAMECHEAP_EMAIL,
      to: email,
      subject: 'Verify Your Account – Action Required',
      html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
        <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
            <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
            <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
          </div>
          <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">VERIFY</h1>
        </div>

        <div style="padding: 40px 20px; background-color: #ffffff;">
          <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700; color: #1A2B4B;">Hello <strong>${name}</strong>,</p>

          <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #64748B;">${welcomeMessage}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #64748B; margin-bottom: 20px;">To complete your registration, please verify your account by clicking the button below:</p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.APP_VERIFY_BASE_URL || 'https://api.coachacadem.ae'}/api/auth/verify/${verificationToken}"
               style="background-color: #1A2B4B; color: #ffffff; padding: 20px 40px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">
              VERIFY NOW
            </a>
          </div>

          <p style="font-size: 14px; color: #64748B; margin: 0; font-weight: 500;">If you didn't sign up for this account, please ignore this email.</p>

          <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
            <p style="color: #64748B; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Best regards,<br>The Coach Academ Team</p>
          </div>
        </div>
      </div>
      `,
      text: `
      Hi ${name},

      ${welcomeMessage}

      To complete your registration, please verify your account by clicking the link below:

      ${process.env.APP_VERIFY_BASE_URL || 'https://api.coachacadem.ae'}/api/auth/verify/${verificationToken}

      If you didn't sign up for this account, please ignore this email.

      Best regards,
      The Coach Academ Team
      `
    }
  

    //send the mail
    try {
        // const response = await transporter.sendMail(mailOptions);
        const response = await resend.emails.send({
            from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
            to: email,
            subject: mailOptions.subject,
            html: mailOptions.html,
        });
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
      console.log(user, 'this is the user in email check');
  
      if (!user) {
        const wantsJson = req.get('Accept')?.includes('application/json') || req.query.format === 'json';
        if (wantsJson) {
          return res.status(400).json({ verified: false, error: 'Invalid or expired verification token' });
        }
        const errorRedirectUrl = process.env.APP_VERIFY_REDIRECT_ERROR_URL || process.env.APP_VERIFY_BASE_URL;
        if (errorRedirectUrl) {
          const redirectTo = `${errorRedirectUrl.replace(/\/$/, '')}/verify-error`;
          return res.redirect(302, redirectTo);
        }
        return res.status(400).send(`
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; background-color: #ffffff;">
            <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Error</h1>
            </div>
            <div style="padding: 40px 20px; background-color: #ffffff;">
              <p style="font-size: 20px; color: #1A2B4B; font-weight: 700;">Invalid verification token</p>
              <p style="font-size: 16px; margin-top: 20px; color: #64748B;">Please check your email for the correct verification link.</p>
              <p style="font-size: 18px; margin-top: 20px; font-weight: 700; color: #1A2B4B; text-decoration: underline;">
                Once your email is verified, a Zoom invite will be sent to you. Please check the spam folder if you don't see it in your inbox. Link expires in 30 days.
              </p>
              <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                <p style="color: #64748B; font-size: 14px; margin: 0;">The Coach Academ Team</p>
              </div>
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
        include: {
          teacherProfile: {
            include: {
              ledOrganization: true
            }
          }
        },
      });

      // create zoom account for teacher
      if(user.userType === 'TEACHER'){
        await createZoomAccountForTeacher(user.email, user.name);
        
        // Generate invite code for team leads after verification
        if (updatedUser.teacherProfile?.isTeamLead && updatedUser.teacherProfile?.ledOrganization) {
          const inviteCode = generateInviteCode();
          await prisma.organization.update({
            where: { id: updatedUser.teacherProfile.ledOrganization.id },
            data: { orgInvite: inviteCode }
          });
        }
      }
  
      // JSON response for server-side verification (e.g. main site calling API)
      const wantsJson = req.get('Accept')?.includes('application/json') || req.query.format === 'json';
      if (wantsJson) {
        return res.status(202).json({ verified: true, message: 'Account verified successfully' });
      }

      // Redirect to main domain success page if configured (avoids "Dangerous site" on API domain)
      const successRedirectUrl = process.env.APP_VERIFY_REDIRECT_SUCCESS_URL || process.env.APP_VERIFY_BASE_URL;
      if (successRedirectUrl) {
        const redirectTo = `${successRedirectUrl.replace(/\/$/, '')}/verified`;
        return res.redirect(302, redirectTo);
      }

      // Send HTML success page (when no redirect URL is set)
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
        <body style="margin: 0; padding: 0; background-color: #F8FAFC;">
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 0; background-color: #ffffff;">
            <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
                <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
                <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Verified</h1>
            </div>

            <div style="padding: 40px 20px; background-color: #ffffff; text-align: center;">
              <div class="success-icon" style="width: 80px; height: 80px; background-color: #1A2B4B; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; transform: rotate(45deg);">
                <span style="color: #ffffff; font-size: 40px; transform: rotate(-45deg);">✓</span>
              </div>

              <h2 style="color: #1A2B4B; font-size: 24px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Account Successfully Verified!</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #64748B; margin-bottom: 30px;">
                Welcome to Coach Academ! Your account has been verified and you can now access all features.
              </p>
              ${user.userType === 'TEACHER' ? `
              <p style="font-size: 18px; line-height: 1.6; color: #1A2B4B; font-weight: 700; margin-bottom: 30px; text-decoration: underline;">
                Once your email is verified, a Zoom invite will be sent to you. Please check the spam folder if you don't see it in your inbox. Link expires in 30 days.
              </p>
              ` : ''}

              <a href="coachacadem://login"
                 style="background-color: #1A2B4B; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
                Proceed to Login
              </a>

              <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
                <p style="color: #64748B; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">The Coach Academ Team</p>
                <p style="color: #1A2B4B; font-size: 16px; font-weight: 700; margin: 0;">Coach Academ Team</p>
              </div>
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
    console.log(req.body, 'this is the login req body');
    try {
      const { email, password } = req.body || {};
      const trimmedEmail = typeof email === 'string' ? email.trim() : '';
      const trimmedPassword = typeof password === 'string' ? password : '';

      if (!trimmedEmail || !trimmedPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Find the user by email with profile
      const user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
        include: {
          studentProfile: true,
          teacherProfile: {
            include: {
              ledOrganization: true,
              organization: true
            }
          },
          adminProfile: true
        }
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      if (!user.verified) {
        return res.status(400).json({ message: "Please verify your email" });
      }
  
      // Compare the provided password with the hashed password in the database
      const isCorrect = bcrypt.compareSync(trimmedPassword, user.password);
  
      if (!isCorrect) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Determine user type and get profile-specific data
      const isTeacher = user.userType === 'TEACHER';
      const isAdmin = user.userType === 'ADMIN';
      const isStudent = user.userType === 'STUDENT';
      
      let recommendedSubjects = [];
      if (isStudent && user.studentProfile) {
        recommendedSubjects = user.studentProfile.reccomendedSubjects || [];
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          userType: user.userType,
          email: user.email,
        },
        process.env.SECRET_KEY
      );
      console.log(user, 'this is the user');
      
      res.status(200).json({
        message: "Login successful",
        token,
        userType: user.userType,
        userId: user.id,
        userName: user.name,
        recommendedSubjects: recommendedSubjects,
        userProfileImage: user.profileImage,
        isTeacher: isTeacher,
        isAdmin: isAdmin,
        hasSeenOnboarding: user.hasSeenOnboarding,
        email: user.email,
        ...(isTeacher && user.teacherProfile && {
          isTeamLead: user.teacherProfile.isTeamLead,
          organization: user.teacherProfile.ledOrganization || user.teacherProfile.organization
        })
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  };

  export const loginSuperAdmin = async (req, res, next) => {
    console.log(req.body, 'this is the login req body');
    try {
      const { email, password } = req.body;
  
      // Find the user by email with admin profile
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          adminProfile: true
        }
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check if user is an admin
      if (user.userType !== 'ADMIN') {
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

      // Determine user type and get profile-specific data
      const isAdmin = user.userType === 'ADMIN';
  
      // Generate a JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          userType: user.userType,
          email: user.email 
        },
        process.env.SECRET_KEY
      );
      console.log(user, 'this is the user');
      
      res.status(200).json({
        message: "Super Admin Login successful",
        token,
        userType: user.userType,
        isTeacher: false,
        isAdmin: isAdmin,
        userId: user.id,
        userName: user.name,
        userProfileImage: user.profileImage,
        hasSeenOnboarding: user.hasSeenOnboarding,
        email: user.email,
        ...(isAdmin && user.adminProfile && {
          adminProfile: user.adminProfile
        })
      });
    } catch (err) {
      console.error(err);
      next(err);
    } 
  };

  export const registerPushToken = async (req, res, next) => {
    try {
      const userId = req.userId;
      const { pushToken } = req.body;

      if (!pushToken || typeof pushToken !== 'string' || !pushToken.trim()) {
        return res.status(400).json({ message: "Push token is required" });
      }

      if (req.userType !== 'ADMIN') {
        return res.status(403).json({ message: "Only admins can register push tokens" });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { pushToken: pushToken.trim() },
      });

      res.status(200).json({ message: "Push token registered" });
    } catch (err) {
      console.error("Error registering push token:", err);
      next(err);
    }
  };

  export const singleUser = async (req, res, next) => {
    try {
      const { userId } = req;
      console.log('first phase ');
      
      // Find the user by ID with profile and related data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: {
            include: {
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
            }
          },
          teacherProfile: {
            include: {
              subjects: true,
              ledOrganization: true,
              organization: true
            }
          },
          adminProfile: true
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Format response based on user type
      const isTeacher = user.userType === 'TEACHER';
      const isStudent = user.userType === 'STUDENT';
      
      let responseData = {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        userType: user.userType,
        isTeacher: isTeacher,
        isAdmin: user.userType === 'ADMIN',
        profileImage: user.profileImage,
        userDescription: user.userDescription,
        hasSeenOnboarding: user.hasSeenOnboarding,
      };

      if (isStudent && user.studentProfile) {
        responseData.reccomendedSubjects = user.studentProfile.reccomendedSubjects || [];
        responseData.recommendedBoard = user.studentProfile.recommendedBoard;
        responseData.recommendedGrade = user.studentProfile.recommendedGrade;
        responseData.userSubjects = user.studentProfile.userSubjects || [];
      }

      if (isTeacher && user.teacherProfile) {
        responseData.subjects = user.teacherProfile.subjects || [];
        responseData.isTeamLead = user.teacherProfile.isTeamLead;
        responseData.organization = user.teacherProfile.ledOrganization || user.teacherProfile.organization;
      }
      
      console.log(responseData, 'this is the user');
      console.log('second phase ');
      res.status(200).json(responseData);
    } catch (err) {
      next(err);
    } 
  };

export const updateProfileImage = async (req, res, next) => {
    const { userId } = req;
    console.log(userId, 'this is the user id');
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
    
    // Find user by ID (teacherProfileId could be User.id or TeacherProfile.id)
    const user = await prisma.user.findUnique({
      where: { id: teacherProfileId },
      include: {
        teacherProfile: {
          include: {
            subjects: {
              select: {
                id: true,
                subjectName: true,
                subjectImage: true,
                subjectBoard: true,
                subjectGrade: true,
                subjectPrice: true,
                subjectVerification: true,
              }
            },
            ledOrganization: true,
            organization: true
          }
        }
      },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.userType !== 'TEACHER' || !user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    // Format response to match expected structure
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      userDescription: user.userDescription,
      userType: user.userType,
      isTeamLead: user.teacherProfile.isTeamLead,
      organization: user.teacherProfile.ledOrganization || user.teacherProfile.organization,
      subjects: user.teacherProfile.subjects || [],
    };

    res.status(200).json(response);
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
  const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    await resend.emails.send({
      from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
          <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
              <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
              <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Password Changed</h1>
          </div>
          <div style="padding: 40px 20px; background-color: #ffffff;">
            <p style="font-size: 20px; color: #1A2B4B; font-weight: 700;">Hello ${user.name},</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">Your password was changed successfully at ${new Date().toLocaleString()}.</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">If you did not make this change, please contact support at <a href="mailto:support@coachacadem.ae" style="color: #1A2B4B; text-decoration: underline;">support@coachacadem.ae</a>.</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">You will need to log in again with your new password.</p>
            <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
              <p style="color: #64748B; font-size: 14px; margin: 0;">The Coach Academ Team</p>
            </div>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Please provide your email address" });
    }
    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (!user) {
      return res.status(200).json({ message: "If an account exists with this email, you will receive a password reset code." });
    }
    const otp = String(crypto.randomInt(100000, 999999));
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: otp,
        passwordResetExpires: resetExpires,
      },
    });
    await resend.emails.send({
      from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
      to: user.email,
      subject: "Your Password Reset Code",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
          <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
              <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
              <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Reset Password</h1>
          </div>
          <div style="padding: 40px 20px; background-color: #ffffff;">
            <p style="font-size: 20px; color: #1A2B4B; font-weight: 700;">Hello ${user.name},</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">You requested a password reset. Enter this code in the app to set a new password. This code expires in 15 minutes.</p>
            <p style="font-size: 28px; margin-top: 20px; font-weight: 700; color: #1A2B4B; letter-spacing: 8px;">${otp}</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">If you did not request this, you can ignore this email.</p>
            <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
              <p style="color: #64748B; font-size: 14px; margin: 0;">The Coach Academ Team</p>
            </div>
          </div>
        </div>
      `,
    });
    res.status(200).json({ message: "If an account exists with this email, you will receive a password reset code." });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Please provide your email address" });
    }
    if (!otp || !String(otp).trim()) {
      return res.status(400).json({ message: "Please provide the code from your email" });
    }
    if (!newPassword) {
      return res.status(400).json({ message: "Please provide your new password" });
    }
    const trimmedEmail = String(email).trim().toLowerCase();
    const otpTrimmed = String(otp).trim();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (!user || user.passwordResetToken !== otpTrimmed || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired code. Please request a new password reset." });
    }
    const hash = bcrypt.hashSync(newPassword, 5);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
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

    // Delete teacher's Zoom user if they have one
    if (user.userType === 'TEACHER' && user.email) {
      try {
        await deleteZoomUser(user.email);
      } catch (zoomErr) {
        console.warn('Could not delete Zoom user on account deletion:', zoomErr.message);
        // Continue with account deletion - don't block if Zoom fails
      }
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
    // Get StudentProfile.id from User.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          select: { id: true }
        }
      }
    });

    if (!user || !user.studentProfile) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const purchase = await prisma.stripePurchases.findFirst({
      where: {
        studentId: user.studentProfile.id,
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

export const zoomTest = async (req, res, next) => {
  try{
    const { email, name } = req.body;
    console.log(email, name, 'this is the email and name');
    const token = await createZoomAccountForTeacher(email, name);
    console.log(token, 'this is the token');
    res.status(200).json({ message: "Zoom test successful", token });
  }
  catch(err){
    next(err);
  }
}

export const resendZoomInviteEmail = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          select: {
            zoomAccountCreated: true,
            zoomUserAcceptedInvite: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.userType !== 'TEACHER') {
      return res.status(400).json({ message: 'Only teachers can request Zoom invite resend' });
    }
    const zoomVerified = user.teacherProfile?.zoomUserAcceptedInvite || user.teacherProfile?.zoomAccountCreated;
    if (zoomVerified) {
      return res.status(400).json({ message: 'Zoom account is already verified' });
    }

    // Try to create Zoom account again in case it was never created
    try {
      await createZoomAccountForTeacher(user.email, user.name);
    } catch (zoomErr) {
      // If user already exists (409), Zoom won't resend - we'll send our reminder email instead
      if (zoomErr.response?.status !== 409 && zoomErr.response?.data?.code !== 1001) {
        console.warn('Zoom account creation/retry had an issue:', zoomErr.message);
      }
    }

    // Send reminder email from our app (Zoom has no API to resend their activation email)
    await resend.emails.send({
      from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
      to: user.email,
      subject: 'Complete your Zoom setup – Coach Academ',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
          <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
              <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
              <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Zoom Setup Reminder</h1>
          </div>
          <div style="padding: 40px 20px; background-color: #ffffff;">
            <p style="font-size: 20px; color: #1A2B4B; font-weight: 700;">Hello ${user.name},</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">Your Zoom account has not been verified yet. To create courses on Coach Academ, you need to complete Zoom setup.</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;"><strong>What to do:</strong></p>
            <ul style="font-size: 16px; line-height: 1.6; color: #64748B;">
              <li>Check your inbox for an email from Zoom (subject may include "Activate your Zoom account" or similar)</li>
              <li>Check your spam or junk folder if you don't see it</li>
              <li>Click the activation link in that email to verify your Zoom account</li>
            </ul>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">The Zoom invite was sent to <strong>${user.email}</strong>. Once you accept it, you'll be able to create courses.</p>
            <p style="font-size: 16px; margin-top: 20px; color: #64748B;">If you still can't find the email, contact us at <a href="mailto:support@coachacadem.ae" style="color: #1A2B4B; text-decoration: underline;">support@coachacadem.ae</a>.</p>
            <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
              <p style="color: #64748B; font-size: 14px; margin: 0;">The Coach Academ Team</p>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: 'Reminder email sent. Please check your inbox and spam folder.' });
  } catch (err) {
    next(err);
  }
};

export const verificationCheck = async (req, res, next) => {
  const userId = req.userId;
  try{
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          select: {
            zoomAccountCreated: true,
            zoomUserAcceptedInvite: true,
          }
        }
      },
    });
    if(!user){
      return res.status(400).json({ message: "User not found" });
    }
    
    const isTeacher = user.userType === 'TEACHER';
    const zoomAccountCreated = user.teacherProfile?.zoomAccountCreated || false;
    const zoomUserAcceptedInvite = user.teacherProfile?.zoomUserAcceptedInvite || false;
    
    return res.status(200).json({ 
      message: "User found", 
      userDetail: {
        isTeacher: isTeacher,
        email: user.email,
        id: user.id,
        zoomAccountCreated: zoomAccountCreated,
        zoomUserAcceptedInvite: zoomUserAcceptedInvite,
      } 
    });
  }
  catch(err){
    next(err);
  }
}

// Update organization trade license after PDF upload
// Can be called with userId from registration (no auth required) or with token (auth required)
export const updateOrganizationTradeLicense = async (req, res, next) => {
  // Support both authenticated (req.userId) and unauthenticated (req.body.userId) requests
  const userId = req.userId || req.body.userId;
  const { tradeLicenseLocation } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!tradeLicenseLocation) {
    return res.status(400).json({ message: "Trade license location is required" });
  }
  
  try {
    // Find user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: true
          }
        }
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User not found or not a teacher" });
    }

    if (!user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    // Check if user is a team lead with an organization
    const organization = user.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "User is not a team lead of an organization" });
    }

    // Update organization trade license
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        orgLicense: tradeLicenseLocation
      }
    });

    res.status(200).json({ 
      message: "Trade license updated successfully", 
      organization: updatedOrganization 
    });
  } catch (err) {
    console.error('Error updating trade license:', err);
    next(err);
  }
}

// Update organization capacity (team lead only)
export const updateOrganizationCapacity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { newCapacity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!newCapacity) {
      return res.status(400).json({ message: "New capacity is required" });
    }

    // Validate capacity is one of the allowed values (13, 18, or 33)
    const validCapacities = [13, 18, 33];
    if (!validCapacities.includes(newCapacity)) {
      return res.status(400).json({ 
        message: "Invalid capacity. Allowed values are 13, 18, or 33" 
      });
    }

    // Get user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: true
          }
        }
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User not found or not a teacher" });
    }

    if (!user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    // Check if user is a team lead
    if (!user.teacherProfile.isTeamLead) {
      return res.status(403).json({ message: "Only team leads can update organization capacity" });
    }

    // Check if user has an organization
    const organization = user.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "User is not a team lead of an organization" });
    }

    // Update organization capacity
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        orgCapacity: newCapacity
      }
    });

    res.status(200).json({ 
      message: "Organization capacity updated successfully", 
      organization: {
        id: updatedOrganization.id,
        orgName: updatedOrganization.orgName,
        orgCapacity: updatedOrganization.orgCapacity,
      }
    });
  } catch (err) {
    console.error('Error updating organization capacity:', err);
    next(err);
  }
}

// Helper function to send organization invitation email
const sendOrganizationInviteEmail = async (teacherEmail, teacherName, orgName, teamLeadName) => {
  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
      <div style="background-color: #1A2B4B; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
          <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px; border: 4px solid #ffffff; transform: rotate(45deg);"></div>
          <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border: 4px solid #ffffff; border-radius: 50%;"></div>
        </div>
        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Organization Invitation</h1>
      </div>

      <div style="padding: 40px 20px; background-color: #ffffff;">
        <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700; color: #1A2B4B;">Hello <strong>${teacherName}</strong>,</p>

        <div style="background-color: #F8FAFC; padding: 30px; margin-bottom: 30px; position: relative; border-left: 4px solid #1A2B4B;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #64748B;">
            You have been invited to join <strong>${orgName}</strong> by <strong>${teamLeadName}</strong>.
          </p>
          <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 1.6; color: #64748B;">
            You are now a member of this organization. You can access organization settings from your profile settings page.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #64748B;">Welcome to the team!</p>

        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
          <p style="color: #64748B; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">The Coach Academ Team</p>
        </div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `Support <${process.env.COACH_ACADEM_RESEND_EMAIL}>`,
      to: teacherEmail,
      subject: `You've been invited to join ${orgName}`,
      html: emailHtml,
    });
    console.log("Organization invitation email sent to", teacherEmail);
  } catch (err) {
    console.log("Error sending organization invitation email", err);
    throw err;
  }
};

// Get organization members
export const getOrganizationMembers = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    // Get user with teacher profile and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            organization: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                      }
                    }
                  }
                },
                teamLead: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                      }
                    }
                  }
                }
              }
            },
            ledOrganization: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                      }
                    }
                  }
                },
                teamLead: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    const organization = user.teacherProfile.ledOrganization || user.teacherProfile.organization;
    
    if (!organization) {
      return res.status(400).json({ message: "User is not part of an organization" });
    }

    // Format members array; include organizationRole from DB for each member
    const teamLeadId = organization.teamLead.user.id;
    const teamLeadRole = organization.teamLead.organizationRole || 'OWNER';
    const regularMembers = organization.members
      .filter(member => member.user.id !== teamLeadId)
      .map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        profileImage: member.user.profileImage,
        isTeamLead: false,
        organizationRole: member.organizationRole || null,
      }));

    const allMembers = [
      {
        id: organization.teamLead.user.id,
        name: organization.teamLead.user.name,
        email: organization.teamLead.user.email,
        profileImage: organization.teamLead.user.profileImage,
        isTeamLead: true,
        organizationRole: teamLeadRole,
      },
      ...regularMembers
    ];

    res.status(200).json({
      organization: {
        id: organization.id,
        orgName: organization.orgName,
        orgCapacity: organization.orgCapacity,
        currentMemberCount: allMembers.length,
        orgInvite: user.teacherProfile.isTeamLead ? organization.orgInvite : null,
      },
      members: allMembers,
      isTeamLead: user.teacherProfile.isTeamLead,
    });
  } catch (err) {
    console.error('Error fetching organization members:', err);
    next(err);
  }
};

// Invite teacher to organization
export const inviteTeacherToOrganization = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Get user (team lead) with organization
    const teamLeadUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: {
              include: {
                members: true,
                teamLead: true,
              }
            }
          }
        }
      }
    });

    if (!teamLeadUser || teamLeadUser.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!teamLeadUser.teacherProfile || !teamLeadUser.teacherProfile.isTeamLead) {
      return res.status(403).json({ message: "Only team leads can invite teachers" });
    }

    const organization = teamLeadUser.teacherProfile.ledOrganization;
    
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    // Check capacity
    const currentMemberCount = organization.members.length ; // +1 for team lead
    if (currentMemberCount >= organization.orgCapacity) {
      return res.status(400).json({ 
        message: `Organization has reached maximum capacity of ${organization.orgCapacity} members` 
      });
    }

    // Find teacher by email
    const teacherUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teacherProfile: true
      }
    });

    if (!teacherUser) {
      return res.status(404).json({ message: "Teacher with this email does not exist" });
    }

    if (teacherUser.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!teacherUser.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    // Check if teacher is already in an organization
    if (teacherUser.teacherProfile.organizationId !== null) {
      return res.status(400).json({ message: "Teacher is already part of an organization" });
    }

    // Check if teacher is already the team lead of another organization
    const existingOrgAsLead = await prisma.organization.findUnique({
      where: { teamLeadId: teacherUser.teacherProfile.id }
    });

    if (existingOrgAsLead) {
      return res.status(400).json({ message: "Teacher is already a team lead of another organization" });
    }

    // Add teacher to organization
    await prisma.teacherProfile.update({
      where: { id: teacherUser.teacherProfile.id },
      data: {
        organizationId: organization.id
      }
    });

    // Send invitation/welcome email
    await sendOrganizationInviteEmail(
      teacherUser.email,
      teacherUser.name,
      organization.orgName,
      teamLeadUser.name
    );

    res.status(200).json({ 
      message: "Teacher invited successfully",
      teacher: {
        id: teacherUser.id,
        name: teacherUser.name,
        email: teacherUser.email,
      }
    });
  } catch (err) {
    console.error('Error inviting teacher:', err);
    next(err);
  }
};

// Get organization invite code (team lead only)
export const getOrganizationInviteCode = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: true
          }
        }
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!user.teacherProfile || !user.teacherProfile.isTeamLead) {
      return res.status(403).json({ message: "Only team leads can view invite code" });
    }

    const organization = user.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    // Generate invite code if it doesn't exist (for existing organizations)
    let inviteCode = organization.orgInvite;
    if (!inviteCode) {
      inviteCode = generateInviteCode();
      await prisma.organization.update({
        where: { id: organization.id },
        data: { orgInvite: inviteCode }
      });
    }

    res.status(200).json({
      inviteCode: inviteCode
    });
  } catch (err) {
    console.error('Error fetching invite code:', err);
    next(err);
  }
};

// Refresh organization invite code (team lead only)
export const refreshOrganizationInviteCode = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: true
          }
        }
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!user.teacherProfile || !user.teacherProfile.isTeamLead) {
      return res.status(403).json({ message: "Only team leads can refresh invite code" });
    }

    const organization = user.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    // Generate new invite code
    const newInviteCode = generateInviteCode();
    
    // Update organization with new invite code
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: { orgInvite: newInviteCode }
    });

    res.status(200).json({
      message: "Invite code refreshed successfully",
      inviteCode: updatedOrganization.orgInvite
    });
  } catch (err) {
    console.error('Error refreshing invite code:', err);
    next(err);
  }
};

// Create organization (teacher only, not already in an org)
export const createOrganization = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { orgName, orgEmail, organizationRole, tradeLicenseLocation } = req.body;

    const trimmedName = orgName != null ? String(orgName).trim() : '';
    if (!trimmedName) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    const trimmedEmail = orgEmail != null ? String(orgEmail).trim() : '';
    if (!trimmedEmail) {
      return res.status(400).json({ message: "Organization email is required" });
    }

    const validRoles = ['OWNER', 'TEACHER', 'MANAGER'];
    const role = organizationRole && validRoles.includes(String(organizationRole).toUpperCase())
      ? String(organizationRole).toUpperCase()
      : 'OWNER';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "Only teachers can create an organization" });
    }

    if (!user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    if (user.teacherProfile.organizationId !== null) {
      return res.status(400).json({ message: "You are already part of an organization" });
    }

    const existingAsLead = await prisma.organization.findUnique({
      where: { teamLeadId: user.teacherProfile.id },
    });
    if (existingAsLead) {
      return res.status(400).json({ message: "You are already the team lead of an organization" });
    }

    const inviteCode = generateInviteCode();
    const organization = await prisma.organization.create({
      data: {
        orgName: trimmedName,
        orgEmail: trimmedEmail,
        orgCapacity: 3,
        orgInvite: inviteCode,
        teamLeadId: user.teacherProfile.id,
        orgLicense: tradeLicenseLocation && String(tradeLicenseLocation).trim() ? String(tradeLicenseLocation).trim() : null,
      },
    });

    await prisma.teacherProfile.update({
      where: { id: user.teacherProfile.id },
      data: {
        isTeamLead: true,
        organizationRole: role,
        organizationId: organization.id,
      },
    });

    res.status(201).json({
      message: "Organization created successfully",
      organization: {
        id: organization.id,
        orgName: organization.orgName,
        orgCapacity: organization.orgCapacity,
      },
    });
  } catch (err) {
    console.error('Error creating organization:', err);
    next(err);
  }
};

// Delete organization (team lead only)
export const deleteOrganization = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { password } = req.body || {};

    if (!password || (typeof password === 'string' && !password.trim())) {
      return res.status(400).json({ message: "Please provide your password" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: { ledOrganization: true },
        },
      },
    });

    if (!user || user.userType !== 'TEACHER' || !user.teacherProfile) {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    const isCorrect = bcrypt.compareSync(password.trim(), user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const organization = user.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "You are not the team lead of an organization" });
    }

    const orgId = organization.id;
    const teamLeadProfileId = user.teacherProfile.id;

    await prisma.$transaction([
      prisma.teacherProfile.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: null, organizationRole: null },
      }),
      prisma.teacherProfile.update({
        where: { id: teamLeadProfileId },
        data: { isTeamLead: false, organizationId: null, organizationRole: null },
      }),
      prisma.organization.delete({
        where: { id: orgId },
      }),
    ]);

    res.status(200).json({
      message: "Organization deleted successfully",
    });
  } catch (err) {
    console.error('Error deleting organization:', err);
    next(err);
  }
};

// Join organization by invite code
export const joinOrganizationByInvite = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    // Get user with teacher profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true
      }
    });

    if (!user || user.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!user.teacherProfile) {
      return res.status(400).json({ message: "Teacher profile not found" });
    }

    // Check if teacher is already in an organization
    if (user.teacherProfile.organizationId !== null) {
      return res.status(400).json({ message: "Teacher is already part of an organization" });
    }

    // Check if teacher is a team lead
    if (user.teacherProfile.isTeamLead) {
      return res.status(400).json({ message: "Team leads cannot join other organizations" });
    }

    // Find organization by invite code
    const organization = await prisma.organization.findUnique({
      where: { orgInvite: inviteCode.toUpperCase() },
      include: {
        members: true
      }
    });

    if (!organization) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // Check capacity
    const currentMemberCount = organization.members.length ; // +1 for team lead
    if (currentMemberCount >= organization.orgCapacity) {
      return res.status(400).json({ 
        message: `Organization has reached maximum capacity of ${organization.orgCapacity} members` 
      });
    }

    // Add teacher to organization
    await prisma.teacherProfile.update({
      where: { id: user.teacherProfile.id },
      data: {
        organizationId: organization.id
      }
    });

    res.status(200).json({
      message: "Successfully joined organization",
      organization: {
        id: organization.id,
        orgName: organization.orgName
      }
    });
  } catch (err) {
    console.error('Error joining organization:', err);
    next(err);
  }
};

// Remove teacher from organization (team lead only)
export const removeTeacherFromOrganization = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { teacherUserId } = req.body;

    if (!teacherUserId) {
      return res.status(400).json({ message: "Teacher user ID is required" });
    }

    // Get user (team lead) with organization
    const teamLeadUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            ledOrganization: {
              include: {
                members: true,
                teamLead: true,
              }
            }
          }
        }
      }
    });

    if (!teamLeadUser || teamLeadUser.userType !== 'TEACHER') {
      return res.status(400).json({ message: "User is not a teacher" });
    }

    if (!teamLeadUser.teacherProfile || !teamLeadUser.teacherProfile.isTeamLead) {
      return res.status(403).json({ message: "Only team leads can remove teachers" });
    }

    const organization = teamLeadUser.teacherProfile.ledOrganization;
    if (!organization) {
      return res.status(400).json({ message: "Organization not found" });
    }

    // Prevent removing the team lead themselves
    if (teamLeadUser.id === teacherUserId) {
      return res.status(400).json({ message: "Cannot remove team lead from organization" });
    }

    // Find the teacher to remove by user ID
    const teacherToRemove = await prisma.user.findUnique({
      where: { id: teacherUserId },
      include: {
        teacherProfile: true
      }
    });

    if (!teacherToRemove || !teacherToRemove.teacherProfile) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if teacher is actually in this organization
    if (teacherToRemove.teacherProfile.organizationId !== organization.id) {
      return res.status(400).json({ message: "Teacher is not a member of this organization" });
    }

    // Remove teacher from organization
    await prisma.teacherProfile.update({
      where: { id: teacherToRemove.teacherProfile.id },
      data: {
        organizationId: null
      }
    });

    res.status(200).json({
      message: "Teacher removed from organization successfully",
      teacher: {
        id: teacherToRemove.id,
        name: teacherToRemove.name,
        email: teacherToRemove.email,
      }
    });
  } catch (err) {
    console.error('Error removing teacher from organization:', err);
    next(err);
  }
};