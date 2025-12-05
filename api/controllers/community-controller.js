import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

export const createCommunity = async (req, res, next) => {
    const { communityProfileImage, communityName } = req.body;
    const userId = req.userId;
    const userType = req.userType;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    // Only ADMIN can create communities
    if (userType !== 'ADMIN') {
        return res.status(403).json({ message: "Only administrators can create communities" });
    }

    try {
        // Create the community (no need to add user since only students join communities)
        const newCommunity = await prisma.community.create({
            data: {
                communityProfileImage,
                communityName,
            },
            include: {
                users: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                    },
                },
                messages: true,
            },
        });

        return res.status(200).json(newCommunity);
    } catch (err) {
        console.error("Error creating community:", err);
        return res.status(500).json({ message: "Failed to create community", error: err });
    }
};

export const getAllCommunity = async (req, res, next) => {
    const { q } = req.query;
    try {
        console.log("inside get all community");
        const searchTerm = q?.toLowerCase();
        const whereClause = searchTerm ? {
            OR: [
                { communityName: { contains: searchTerm, mode: 'insensitive' } }
            ]
        } : {};
        
        // Fetch all communities
        const communities = await prisma.community.findMany({
            include: {
                users: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                    },
                },
                messages: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                    },
                    take: 1, // Just get count or last message
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            where: whereClause,
        });

        // Transform response to match expected format
        const transformedCommunities = communities.map(community => ({
            ...community,
            users: community.users.map(cu => ({
                ...cu,
                user: cu.student?.user || cu.teacher?.user,
            })),
            lastMessage: community.messages[0] ? {
                text: community.messages[0].text,
                timestamp: community.messages[0].createdAt,
                sender: community.messages[0].teacher?.user,
            } : null,
        }));

        console.log("communities", transformedCommunities);
        return res.status(200).json(transformedCommunities);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const updateSingleCommunity = async (req, res, next) => {
    const { communityId } = req.params;
    const userId = req.userId;
    const userType = req.userType;
    console.log(communityId, "communityId coming from the client to update the community.");

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // Get user with both student and teacher profiles
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: {
                    select: { id: true }
                },
                teacherProfile: {
                    select: { id: true }
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Determine which profile to use
        let profileId = null;
        let isStudent = false;
        let isTeacher = false;

        if (userType === 'STUDENT' && user.studentProfile) {
            profileId = user.studentProfile.id;
            isStudent = true;
        } else if (userType === 'TEACHER' && user.teacherProfile) {
            profileId = user.teacherProfile.id;
            isTeacher = true;
        } else {
            return res.status(400).json({ message: "Only students and teachers can join communities." });
        }

        // Find the community by ID
        const findCommunity = await prisma.community.findUnique({
            where: {
                id: communityId,
            },
            include: {
                users: true,
            },
        });

        if (!findCommunity) {
            return res.status(404).json({ message: "Community not found" });
        }

        // Check if the user is already part of the community
        const isUserPartOfCommunity = findCommunity.users.some(
            (cu) => (isStudent && cu.studentId === profileId) || (isTeacher && cu.teacherId === profileId)
        );

        if (isUserPartOfCommunity) {
            return res.status(200).json({ message: "You are already part of this community" });
        }

        // Add the user to the community
        await prisma.community.update({
            where: {
                id: communityId,
            },
            data: {
                users: {
                    create: {
                        ...(isStudent ? { studentId: profileId } : {}),
                        ...(isTeacher ? { teacherId: profileId } : {}),
                    },
                },
            },
        });

        return res.status(200).json({ message: "Community updated successfully" });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const getOneCommunity = async (req, res, next) => {
    const { communityId } = req.params;
    console.log(communityId, "communityId coming from the client to get the community.");
    
    try {
        // Find the community by ID and include messages
        const findCommunity = await prisma.community.findUnique({
            where: {
                id: communityId,
            },
            include: {
                messages: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                users: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // If community not found, return 404
        if (!findCommunity) {
            return res.status(404).json({ message: "Community not found" });
        }

        // Transform response to match expected format
        const transformedCommunity = {
            ...findCommunity,
            messages: findCommunity.messages.map(msg => ({
                ...msg,
                sender: msg.teacher?.user,
            })),
            users: findCommunity.users.map(cu => ({
                ...cu,
                user: cu.student?.user || cu.teacher?.user,
            })),
        };

        // Return the community with messages
        return res.status(200).json(transformedCommunity);
    } catch (err) {
        console.log(err);
        next(err);
    }
};