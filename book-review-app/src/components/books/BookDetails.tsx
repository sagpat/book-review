import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  Rating,
  CardMedia,
  TextField,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../apis/api";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { fetchSimilarBooks } from "../../features/recommendations/recommendationsSlice";
import getFormattedDate from "../../helper/Date";

const BookDetails = () => {
  const reviewDate = getFormattedDate(new Date().toLocaleDateString());
  console.log("reviewDate", reviewDate);
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const bookId = searchParams.get("id");
  const username = useAppSelector((state) => state.auth.loggedinUser);
  const { similarBooks, loading } = useAppSelector((state) => state.recommendations);

  // State to manage reviews and user input
  const [book, setBookDetails] = useState<any>({});
  const [reviews, setReviews] = useState<
    {
      [x: string]: any; id: number; username: string | null; rating: number; reviewText: string 
}[]
  >([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState<number | null>(0);
  const authToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch reviews when the component loads
  useEffect(() => {
    console.log("bookId", bookId);
    if (bookId) {
      const getBookReviews = apiRequest(
        "post",
        "/api/reviews/getBooksReviews",
        { bookId },
        authToken
      );
      getBookReviews.then((data) => setReviews(data));

      const getBookDetails = apiRequest(
        "post",
        "/api/books/getBookDetails",
        { bookId },
        authToken
      );
      getBookDetails.then((data) => setBookDetails(data));

      // Fetch similar books using the microservice
      if (authToken) {
        dispatch(fetchSimilarBooks({ bookId, token: authToken }));
      }
    }
  }, [bookId, dispatch, authToken]);

  // Handle submitting a new review
  const handleSubmitReview = async () => {
    console.log(
      "newRating, newReview, id",
      newRating,
      newReview,
      userId,
      reviewDate
    );
    if (newRating && newReview && userId) {
      const response = await apiRequest(
        "post",
        "/api/reviews/createReview",
        {
          bookId,
          userId,
          rating: newRating,
          reviewText: newReview,
          reviewDate,
        },
        authToken
      );
      console.log("response::", response);
      if (response.suceess) {
        console.log("response2::", response);
        setReviews((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            username,
            rating: newRating,
            reviewText: newReview,
          },
        ]);
        setNewReview("");
        setNewRating(0);
      }
    }
  };

  console.log("reviews::::::", reviews);
  console.log("book:::::", book);

  // TODO: seperate out the components.
  // 1. Book details like image, desc & rating
  // 2. Rating and leave a review
  // 3. User reviews


  return (
    <Paper
      sx={{
        margin: "auto",
        marginTop: "20%",
        alignItems: "center",
        name: "book-details",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "1rem",
          justifyContent: "center",
        }}
      >
        <CardMedia
          component="img"
          image={book.bookCover}
          sx={{ width: 200, height: 300, marginRight: "1rem" }}
        />
        <Box>
          <Typography variant="h3" sx={{ padding: "5px" }}>
            {book.title}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {book.author}
          </Typography>
          <Rating name="read-only" value={book.overallRating} readOnly />
          <Typography variant="body2" sx={{ textTransform: "lowercase" }}>
            {book.description}
          </Typography>
        </Box>
      </Box>

      {/* User review input */}
      <Box sx={{ padding: "1rem" }}>
        <Typography variant="h6">Leave a Review:</Typography>
        <TextField
          label="Review"
          fullWidth
          multiline
          margin="normal"
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        <Box>
          <Rating
            name="new-rating"
            value={newRating}
            onChange={(event, newValue) => setNewRating(newValue)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmitReview}
          >
            Submit Review
          </Button>
        </Box>
      </Box>

      {/* Display existing reviews */}
      <Box sx={{ padding: "1rem" }}>
        <Typography variant="h6">Reviews:</Typography>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Paper key={review.id} sx={{ padding: "1rem", margin: "1rem 0" }}>
              <Typography variant="subtitle1">
                <strong>{review?.User?.username || review.username}</strong> rated:{" "}
                <Rating name="read-only" value={review.rating} readOnly />
              </Typography>
              <Typography variant="body1">{review.reviewText}</Typography>
            </Paper>
          ))
        ) : (
          <Typography>No reviews yet.</Typography>
        )}
      </Box>

      {/* Similar Books Section */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ padding: "1rem" }}>
        <Typography variant="h6" gutterBottom>
          You Might Also Like
        </Typography>
        {loading.similarBooks ? (
          <Typography>Loading similar books...</Typography>
        ) : similarBooks && Array.isArray(similarBooks) && similarBooks.length > 0 ? (
          <Grid container spacing={2}>
            {(Array.isArray(similarBooks) ? similarBooks : []).slice(0, 4).map((similarBook) => (
              <Grid item xs={12} sm={6} md={3} key={similarBook.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => navigate(`/book-details?id=${similarBook.id}`)}
                >
                  {similarBook.thumbnail && (
                    <CardMedia
                      component="img"
                      height="150"
                      image={similarBook.thumbnail}
                      alt={similarBook.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {similarBook.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {similarBook.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Rating 
                        value={similarBook.overallRating || 0} 
                        readOnly 
                        size="small"
                        precision={0.5}
                      />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        ({similarBook.overallRating || 0})
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            No similar books found at the moment.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default BookDetails;
