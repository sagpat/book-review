// EnhancedBookSearch.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  CardMedia,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  searchBooks,
  advancedSearchBooks,
  clearSearchResults,
  setCurrentQuery,
} from '../../features/search/searchSlice';

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Thriller', 'Science Fiction',
  'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Health',
];

const EnhancedBookSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const authToken = localStorage.getItem('token');
  const {
    searchResults,
    advancedSearchResults,
    currentQuery,
    loading,
    error,
  } = useAppSelector((state) => state.search);

  // Search states
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced search filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const [author, setAuthor] = useState('');
  const [yearRange, setYearRange] = useState<number[]>([1950, new Date().getFullYear()]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 5]);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSimpleSearch = () => {
    if (query.trim()) {
      dispatch(setCurrentQuery(query));
      dispatch(searchBooks({ query: query.trim(), token: authToken || undefined }));
    }
  };

  const handleAdvancedSearch = () => {
    const filters = {
      ...(selectedGenre && { genre: selectedGenre }),
      ...(author.trim() && { author: author.trim() }),
      yearRange: {
        start: yearRange[0],
        end: yearRange[1],
      },
      ratingRange: {
        min: ratingRange[0],
        max: ratingRange[1],
      },
    };
    
    dispatch(advancedSearchBooks({ filters, token: authToken || undefined }));
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedGenre('');
    setAuthor('');
    setYearRange([1950, new Date().getFullYear()]);
    setRatingRange([0, 5]);
    dispatch(clearSearchResults());
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSimpleSearch();
    }
  };

  const displayResults = advancedSearchResults.length > 0 ? advancedSearchResults : searchResults;
  const isLoading = loading.search || loading.advancedSearch;
  const searchError = error.search || error.advancedSearch;

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (searchError) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {searchError}
        </Alert>
      );
    }

    if (displayResults.length === 0 && (currentQuery || advancedSearchResults.length === 0)) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          {currentQuery ? 'No books found matching your search criteria.' : 'Enter a search term to find books.'}
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {displayResults.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleBookClick(book.id)}
            >
              {book.thumbnail && (
                <CardMedia
                  component="img"
                  height="200"
                  image={book.thumbnail}
                  alt={book.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{
                    fontSize: '1rem',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  by {book.author}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating
                    value={book.overallRating || 0}
                    readOnly
                    precision={0.5}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    ({book.overallRating || 0})
                  </Typography>
                </Box>
                {book.genre && (
                  <Chip
                    label={book.genre}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start', mt: 'auto' }}
                  />
                )}
                {book.publishedYear && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Published: {book.publishedYear}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Books
      </Typography>

      {/* Simple Search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search by title, author, or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSimpleSearch}
                disabled={!query.trim() || isLoading}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAdvanced(!showAdvanced)}
                startIcon={<FilterListIcon />}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Search */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advanced Search Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={selectedGenre}
                  label="Genre"
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Publication Year Range</Typography>
              <Slider
                value={yearRange}
                onChange={(_, newValue) => setYearRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={1950}
                max={new Date().getFullYear()}
                marks={[
                  { value: 1950, label: '1950' },
                  { value: new Date().getFullYear(), label: new Date().getFullYear().toString() },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Rating Range</Typography>
              <Slider
                value={ratingRange}
                onChange={(_, newValue) => setRatingRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                ]}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAdvancedSearch}
                  disabled={isLoading}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Search Results */}
      <Box sx={{ mt: 4 }}>
        {(currentQuery || advancedSearchResults.length > 0) && (
          <Typography variant="h5" gutterBottom>
            Search Results
            {displayResults.length > 0 && (
              <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                ({displayResults.length} books found)
              </Typography>
            )}
          </Typography>
        )}
        {renderSearchResults()}
      </Box>
    </Box>
  );
};

export default EnhancedBookSearch;