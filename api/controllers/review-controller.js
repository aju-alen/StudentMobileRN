import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReview = async (req, res, next) => {
  try {
    const { title, description, subjectId } = req.body;
    const userId = req.userId; // Assuming user ID is available from auth middleware

    const review = await prisma.review.create({
      data: {
        title,
        description,
        userId,
        subjectId,
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    next(error);
  }
};

export const getSubjectReviews = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        subjectId,
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    next(error);
  }
};

export const voteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body;
    const userId = req.userId;

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user has already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    let updatedReview;
    let userVote;

    if (existingVote) {
      // If user is voting the same way again, remove their vote
      if (existingVote.voteType === voteType) {
        await prisma.reviewVote.delete({
          where: {
            userId_reviewId: {
              userId,
              reviewId,
            },
          },
        });

        updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: {
            upvotes: voteType === 'up' ? review.upvotes - 1 : review.upvotes,
            downvotes: voteType === 'down' ? review.downvotes - 1 : review.downvotes,
          },
        });
        userVote = null;
      } else {
        // If user is changing their vote
        await prisma.reviewVote.update({
          where: {
            userId_reviewId: {
              userId,
              reviewId,
            },
          },
          data: { voteType },
        });

        updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: {
            upvotes: voteType === 'up' ? review.upvotes + 1 : review.upvotes - 1,
            downvotes: voteType === 'down' ? review.downvotes + 1 : review.downvotes - 1,
          },
        });
        userVote = voteType;
      }
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          userId,
          reviewId,
          voteType,
        },
      });

      updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          upvotes: voteType === 'up' ? review.upvotes + 1 : review.upvotes,
          downvotes: voteType === 'down' ? review.downvotes + 1 : review.downvotes,
        },
      });
      userVote = voteType;
    }

    res.status(200).json({
      upvotes: updatedReview.upvotes,
      downvotes: updatedReview.downvotes,
      userVote,
    });
  } catch (err) {
    next(err);
  } 
}; 