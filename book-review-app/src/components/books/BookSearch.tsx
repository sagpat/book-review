import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface BookSearchProps {
  onSearch: (query: string) => void;
}

const BookSearch = ({ onSearch }: BookSearchProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");  // Trigger a reset of the search results
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
      <TextField
        label="Search by title or author"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ marginRight: 2 }}
      />
      <Button variant="contained" onClick={handleSearch} sx={{ marginRight: 2 }}>
        Search
      </Button>
      <Button variant="outlined" onClick={handleClear}>
        Clear
      </Button>
    </Box>
  );
};

export default BookSearch;
