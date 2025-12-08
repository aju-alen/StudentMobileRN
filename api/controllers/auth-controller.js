import crypto from "crypto";
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
import { Resend } from 'resend';
dotenv.config();
import { sendEmailService } from "../services/emailService.js";
import { createZoomAccountForTeacher } from "../services/zoomService.js";
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
            teacherCount
        } = req.body;
        
        console.log(req.body, 'this is the req body');

        if (!name || !email || !password || !userType) {
            return res.status(400).json({ message: "Please enter all required fields" });
        }

        // Validate userType
        const validUserTypes = ['STUDENT', 'TEACHER', 'ADMIN', 'ORGANIZATION'];
        if (!validUserTypes.includes(userType.toUpperCase())) {
            return res.status(400).json({ message: "Invalid user type" });
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
            if (!organizationName || !organizationEmail || !organizationWebsite) {
                // Rollback user creation if organization data is incomplete
                await prisma.user.delete({ where: { id: newUser.id } });
                return res.status(400).json({ message: "Organization fields are required for organization registration" });
            }

            // Update teacher profile to be team lead
            await prisma.teacherProfile.update({
                where: { id: profile.id },
                data: { isTeamLead: true }
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
        console.log(newUser.email, verificationToken, name, isTeacher, 'this is the new user');
        
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
        // const response = await transporter.sendMail(mailOptions);
        const response = await resend.emails.send({
            from: process.env.COACH_ACADEM_RESEND_EMAIL,
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
              <p style="font-size: 18px; margin-top: 20px; font-weight: 700; color: #FF0000; text-decoration: underline;">
                Once your email is verified, a Zoom invite will be sent to you.
              </p>
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
              ${user.userType === 'TEACHER' ? `
              <p style="font-size: 18px; line-height: 1.6; color: #FF0000; font-weight: 700; margin-bottom: 30px; text-decoration: underline;">
                Once your email is verified, a Zoom invite will be sent to you.
              </p>
              ` : ''}
              
              <!-- Geometric separator -->
              <div style="display: flex; margin: 30px auto; max-width: 200px;">
                <div style="width: 30%; height: 3px; background-color: #FF0000;"></div>
                <div style="width: 40%; height: 3px; background-color: #000000;"></div>
                <div style="width: 30%; height: 3px; background-color: #FFD700;"></div>
              </div>
              
              <a href="coachacadem://login"
                 style="background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
                Proceed to Login
              </a>
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
    console.log(req.body, 'this is the login req body');
    try {
      const { email, password } = req.body;
  
      // Find the user by email with profile
      const user = await prisma.user.findUnique({
        where: { email },
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
      const isCorrect = bcrypt.compareSync(password, user.password);
  
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
            <div style="width: 20%; background-color: #1A4C6E;"></div>
            <div style="width: 60%; background-color: #1A4C6E; color: #ffffff; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Password Changed</h1>
            </div>
            <div style="width: 20%; background-color: #1A4C6E;"></div>
          </div>
          
          <div style="padding: 30px; color: #000000;">
            <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700;">Hello <strong>${user.name}</strong>,</p>
            
            <!-- Geometric highlight box -->
            <div style="background-color: #f5f5f5; padding: 25px; margin: 25px 0; border-left: 8px solid #1A4C6E;">
              <p style="margin: 0; font-size: 16px; line-height: 1.8; font-weight: 500;">Your password has been successfully changed at ${new Date().toLocaleString()} (GMT+4).</p>
            </div>
            
            <!-- Warning Box -->
            <div style="background-color: #1A4C6E; border: 1px solid #ffeeba; color: #fff; padding: 20px; margin: 25px 0; border-left: 8px solid #FFD700;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">⚠️ Important Security Notice</h3>
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">If you did not make this change, please contact our security team immediately at <a href="mailto:support@coachacadem.ae" style="color:rgb(255, 255, 255); text-decoration: underline;">support@coachacadem.ae</a></p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">For your security, please note:</p>
            <ul style="font-size: 16px; line-height: 1.6; font-weight: 500;">
              <li>Your new password is now active</li>
              <li>All existing sessions have been logged out</li>
              <li>You will need to log in again with your new password</li>
            </ul>
            
            <!-- Geometric separator -->
            <div style="display: flex; margin: 30px 0;">
              <div style="width: 30%; height: 3px; background-color: #1A4C6E;"></div>
              <div style="width: 40%; height: 3px; background-color: #1A4C6E;"></div>
              <div style="width: 30%; height: 3px; background-color: #1A4C6E;"></div>
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

// Helper function to send organization invitation email
const sendOrganizationInviteEmail = async (teacherEmail, teacherName, orgName, teamLeadName) => {
  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
      <div style="display: flex; margin-bottom: 20px;">
        <div style="width: 20%; background-color: #1A4C6E;"></div>
        <div style="width: 60%; background-color: #1A4C6E; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">Organization Invitation</h1>
        </div>
        <div style="width: 20%; background-color: #1A4C6E;"></div>
      </div>
      
      <div style="padding: 30px; color: #000000;">
        <p style="font-size: 20px; margin-bottom: 20px; font-weight: 700;">Hello <strong>${teacherName}</strong>,</p>
        
        <div style="background-color: #f5f5f5; padding: 25px; margin: 25px 0; border-left: 8px solid #1A4C6E;">
          <p style="margin: 0; font-size: 16px; line-height: 1.8; font-weight: 500;">
            You have been invited to join <strong>${orgName}</strong> by <strong>${teamLeadName}</strong>.
          </p>
          <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 1.8; font-weight: 500;">
            You are now a member of this organization. You can access organization settings from your profile settings page.
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; font-weight: 500;">Welcome to the team!</p>
        
        <div style="text-align: center; padding-top: 30px; border-top: 2px solid #F8FAFC;">
          <p style="color: #64748B; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">The Coach Academ Team</p>
        </div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.COACH_ACADEM_RESEND_EMAIL,
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

    // Format members array
    // Filter out team lead from members to avoid duplicates
    const teamLeadId = organization.teamLead.user.id;
    const regularMembers = organization.members
      .filter(member => member.user.id !== teamLeadId)
      .map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        profileImage: member.user.profileImage,
        isTeamLead: false,
      }));

    const allMembers = [
      {
        id: organization.teamLead.user.id,
        name: organization.teamLead.user.name,
        email: organization.teamLead.user.email,
        profileImage: organization.teamLead.user.profileImage,
        isTeamLead: true,
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
    const currentMemberCount = organization.members.length + 1; // +1 for team lead
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
    const currentMemberCount = organization.members.length + 1; // +1 for team lead
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