import React, { useState } from "react";
import { Box, Button, TextField, Typography, Rating } from "@mui/material";
import { apiRequest } from "../../apis/api";

const CreateBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | null>(0);
  const [thumbnailBase64, setThumbnailBase64] = useState(""); // Base64 string of the image
  const [publicationDate, setpublicationDate] = useState("");
  const authToken = localStorage.getItem("token");

  // Function to handle image upload and resize
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.src = event.target?.result as string;
        image.onload = () => {
          // Resize the image to 400x400 px
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(image, 0, 0, 400, 400);
            const resizedImageBase64 = canvas.toDataURL("image/jpeg");
            setThumbnailBase64(resizedImageBase64); // Set base64 string
          }
        };
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await apiRequest(
        "post",
        "/api/books/createBook",
        { 
            title,
            author,
            description,
            rating,
            bookCover: thumbnailBase64,
            publicationDate
         },
        authToken
      );

      if (response.status === "success") {
        console.log("Book created successfully");
      } else {
        console.error("Failed to create book");
      }
    } catch (error) {
      console.error("Error creating book", error);
    }
  };

  return (
    <Box sx={{display: "grid"}}>
      <Typography variant="h4">Create a New Book</Typography>
      <Typography variant="h6">
        Hello Admin, you can create a new book using following form.
      </Typography>

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        multiline
      />
      <TextField
        type="date"
        label="Published Date"
        slotProps={{
            inputLabel: { shrink: true }, // Use slotProps instead of InputLabelProps
          }}
        value={publicationDate}
        onChange={(e) => setpublicationDate(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Rating
        name="rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
        precision={1}
        sx= {{marginBottom: "20px"}}
      />
      <main>Upload a Book Cover:</main>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <Button variant="contained" sx= {{marginTop: "20px"}} onClick={handleSubmit}>
        Create Book
      </Button>
    </Box>
  );
};

export default CreateBook;
