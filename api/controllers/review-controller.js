
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