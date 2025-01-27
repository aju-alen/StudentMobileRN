import dotenv from "dotenv";
import Community from '../models/community.js'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

export const createCommunity = async (req, res, next) => {
    const { communityProfileImage, communityName } = req.body;
const userId = req.userId || "hardcoded-user-id"; // Replace with your actual user ID

if (!userId) {
  return res.status(400).json({ message: "User ID is required" });
}

try {
  // Create the community and associate the user
  const newCommunity = await prisma.community.create({
    data: {
      communityProfileImage,
      communityName,
      users: {
        create: {
          user: {
            connect: { id: "cm666o4hy0000obvmehlfgpho" },
          },
        },
      },
    },
    include: {
      users: {
        include: {
          user: true, // Include user details in the response
        },
      },
    },
  });

  return res.status(200).json(newCommunity);
} catch (err) {
  console.error("Error creating community:", err);
  return res.status(500).json({ message: "Failed to create community", error: err });
}
};

export const getAllCommunity = async (req, res, next) => {
    try {
      console.log("inside get all community");
  
      // Fetch all communities
      const communities = await prisma.community.findMany({
        include: {
          users: {
            include: {
              user: true, // Include user details associated with the community
            },
          },
          messages: true, // Include messages if needed
        },
      });
  
      console.log("communities", communities);
      return res.status(200).json(communities);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  export const updateSingleCommunity = async (req, res, next) => {
    const { communityId } = req.params;
    console.log(communityId, "communityId coming from the client to update the community.");
  
    try {
      // Find the community by ID
      const findCommunity = await prisma.community.findUnique({
        where: {
          id: communityId,
        },
        include: {
          users: true,
          messages: {
            select: {
                senderId: true,
                text: true,
                messageId: true,
                createdAt: true,
                updatedAt: true,
            }
        }, 
        },
      });
  
      if (!findCommunity) {
        return res.status(404).send("Community not found");
      }
  
      // Check if the user is already part of the community
      const isUserPartOfCommunity = findCommunity.users.some(
        (user) => user.userId === req.userId
      );
  
      if (isUserPartOfCommunity) {
        return res.status(200).send("You are already part of this community");
      }
  
      // Add the user to the community
      const updatedCommunity = await prisma.community.update({
        where: {
          id: communityId,
        },
        data: {
          users: {
            create: [
              {
                userId: req.userId, // Create a new relation in the `CommunityUser` table
              },
            ],
          },
        },
      });
  
      return res.status(200).send("Community updated successfully");
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
          messages: true, // Include messages associated with the community
        },
      });
  
      // If community not found, return 404
      if (!findCommunity) {
        return res.status(404).send("Community not found");
      }
  
      // Return the community with messages
      return res.status(200).json(findCommunity);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };