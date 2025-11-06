import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Rating,
  Divider,
  Box,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../apis/api";
import BookSearch from "./BookSearch";

interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  thumbnail?: string;
  genre?: string;
  publishedYear?: number;
  overallRating: string | number; // API returns string, but Rating expects number
  createdAt?: string;
  updatedAt?: string;
}

const truncateText = (text: string | null | undefined, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  console.log("Truncating text:", text);
  return text.slice(0, maxLength) + "...";
};

const BookList = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("token");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const fetchedBooks = await apiRequest(
        "get",
        "/api/books/getBooks",
        {},
        authToken
      );
      
      // Ensure fetchedBooks is an array and process the data safely
      const booksArray = Array.isArray(fetchedBooks) ? fetchedBooks : [];
      console.log("Fetched books:", booksArray);
      
      setBooks(booksArray);
      setSearchResults(booksArray); // Initialize search results with all books
      setError(null);
    } catch (err) {
      setError("Failed to fetch books. Please try again later.");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (query: string) => {
    // Ensure books is an array before filtering
    const booksArray = Array.isArray(books) ? books : [];
    const filteredBooks = booksArray.filter(
      (book) =>
        (book.title?.toLowerCase().includes(query.toLowerCase()) || false) ||
        (book.author?.toLowerCase().includes(query.toLowerCase()) || false)
    );
    setSearchResults(filteredBooks); // Update the displayed books based on the search
  };

  if (loading) {
    return <div>Loading books...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleClick = (param: number) => {
    navigate(`/book-details?id=${param}`);
  };

  return (
    <Box sx={{ marginTop: "10%" }}>
      <BookSearch onSearch={handleSearch} />
      <Grid
        sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}
        container
        spacing={2}
      >
        {(Array.isArray(searchResults) ? searchResults : []).map((book) => (
          <Button
            key={book.id}
            component="button"
            onClick={() => handleClick(book.id)}
            sx={{
              justifyContent: "center",
              outline: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <Paper sx={{ height: 250, width: 300 }}>
              <Box sx={{ padding: "1rem" }}>
                <Typography variant="body1" sx={{ padding: "5px" }}>
                  {book.title}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  {book.author}
                </Typography>
                <Rating name="read-only" value={parseFloat(book.overallRating?.toString() || '0')} readOnly />
                <Divider
                  orientation="horizontal"
                  sx={{ marginBottom: "8px" }}
                />
                <Typography variant="body2" sx={{ textTransform: "lowercase" }}>
                  {truncateText(book.description, 140)}
                </Typography>
              </Box>
            </Paper>
          </Button>
        ))}
      </Grid>
    </Box>
  );
};

export default BookList;
