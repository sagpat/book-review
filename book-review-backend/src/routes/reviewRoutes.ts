import express from "express";
import {
  createReview,
  deleteReview,
  editReview,
  getBooksReviews,
  getReviews,
  getUserReviews,
} from "../controllers/reviewController";

const router = express.Router();

router.post("/createReview", createReview);
router.post("/getReviews", getReviews);
router.post("/getBooksReviews", getBooksReviews);
router.post("/getUserReviews", getUserReviews);
router.put("/:reviewId", editReview);
router.delete("/:reviewId", deleteReview);
export default router;
