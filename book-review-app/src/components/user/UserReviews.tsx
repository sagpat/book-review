import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  TextField,
  Rating,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { apiRequest } from "../../apis/api";
import { useAppSelector } from "../../hooks/useAppSelector";

interface Review {
  Book: any;
  id: number;
  bookTitle: string;
  rating: number;
  reviewText: string;
}

const UserReviews = () => {
  const id = useAppSelector((state) => state.auth.id); // id here is userId. TODO: update with explicit name 
  const username = useAppSelector((state) => state.auth.loggedinUser); // to use
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [editedReviewText, setEditedReviewText] = useState<string>("");
  const [editedRating, setEditedRating] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const authToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch user reviews
  useEffect(() => {
    const getUserReviews = apiRequest(
      "post",
      "/api/reviews/getUserReviews",
      { userId },
      authToken
    );
    getUserReviews.then((data) => setReviews(data));
  }, []);

  // Handle review edit
  const handleEdit = (review: Review) => {
    setEditReviewId(review.id);
    setEditedReviewText(review.reviewText);
    setEditedRating(review.rating);
    setOpen(true);
  };

  const handleSaveEdit = async () => {

    console.log('editReviewId::', editReviewId)
    if (editReviewId !== null) {
      apiRequest(
        "put",
        `/api/reviews/${editReviewId}`,
        { reviewText: editedReviewText, rating: editedRating, id },
        authToken
      )

      // Update UI
      const updatedReviews = reviews.map((review) =>
        review.id === editReviewId
          ? { ...review, reviewText: editedReviewText, rating: editedRating }
          : review
      );
      setReviews(updatedReviews);
      setOpen(false);
    }
  };

// Handle review deletion
  const handleDelete = async (reviewId: number) => {
    if (reviewId !== null)
      apiRequest(
        "delete",
        `/api/reviews/${reviewId}`,
        { userId },
        authToken
      )
    setReviews(reviews.filter((review) => review.id !== reviewId));
  }

  return (
    <Paper sx={{ padding: "2rem", marginTop: "10%", maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        {`Hello ${username}, your reviews`}
      </Typography>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{review?.Book?.title}</Typography>
                <Rating value={review.rating} readOnly />
                <Typography variant="body1">{review.reviewText}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleEdit(review)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(review.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Divider sx ={{marginTop: "5px"}} />
          </Grid>
        ))}
      </Grid>

      {/* Edit Review Dialog
      TODO: add as seprate component */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can edit your review and rating below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Review Text"
            fullWidth
            value={editedReviewText}
            onChange={(e) => setEditedReviewText(e.target.value)}
          />
          <Rating
            value={editedRating}
            onChange={(e, newValue) => setEditedRating(newValue)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserReviews;
