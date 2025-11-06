import { Request, Response } from "express";
import Review from "../models/review";
import User from "../models/user";
import Book from "../models/book";

export const createReview = async (req: Request, res: Response) => {
  try {
    console.log("req.body:::", req.body);
    const review = await Review.create({
      ...req.body,
      userId: req.body.userId,
    });
    console.log("review:::", review);

    res.status(201).json({ suceess: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const reviews = await Review.findAll({ where: { userId } });
    res.status(201).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBooksReviews = async (req: Request, res: Response) => {
  const { bookId } = req.body;
  /*
    SELECT r.*, u.username
    FROM Reviews r eview r
    JOIN Users u ON r.userId = u.id
    WHERE r.bookId = 4
  */
  // modeling query
  try {
    const reviews = await Review.findAll({
      where: { bookId: bookId },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    res.status(201).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    const reviews = await Review.findAll({
      where: { userId },
      include: [{ model: Book, attributes: ['title'] }]
    });
    res.status(201).json(reviews);;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};


export const editReview = async (req: any, res: any) => {
  try {
    const { reviewText, rating, id } = req.body;
    const reviewId = req.params.reviewId;
    console.log("req.body:::", req.body);
    const review = await Review.findOne({ where: { id: reviewId, userId: id } });
    console.log("review:::", review);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.reviewText = reviewText;
    review.rating = rating;
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit review' });
  }
};

// Delete a review
export const deleteReview = async (req: any, res: any) => {
  try {
    const { id } = req.body;
    const reviewId = req.params.reviewId;

    const review = await Review.findOne({ where: { id: reviewId, userId: id } });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy();
    res.status(201).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};