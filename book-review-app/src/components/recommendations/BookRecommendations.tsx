// BookRecommendations.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  fetchUserRecommendations,
  fetchTrendingBooks,
  clearRecommendations,
} from '../../features/recommendations/recommendationsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BookRecommendations: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const authToken = localStorage.getItem('token');
  const userId = useAppSelector((state) => state.auth.id);
  const {
    userRecommendations,
    trendingBooks,
    loading,
    error,
  } = useAppSelector((state) => state.recommendations);

  useEffect(() => {
    if (userId && authToken) {
      dispatch(fetchUserRecommendations({ userId: userId.toString(), limit: 10, token: authToken }));
    }
    if (authToken) {
      dispatch(fetchTrendingBooks({ token: authToken }));
    }

    return () => {
      dispatch(clearRecommendations());
    };
  }, [dispatch, userId, authToken]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  const renderBookGrid = (books: any[], isLoading: boolean, errorMsg: string | null) => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (errorMsg) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      );
    }

    if (!books || books.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No recommendations available at the moment.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {books.map((book) => (
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
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
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
                  <Typography 
                    variant="caption" 
                    color="primary"
                    sx={{ 
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      alignSelf: 'flex-start',
                      mt: 'auto',
                    }}
                  >
                    {book.genre}
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
        Discover Books
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="book recommendations tabs">
          <Tab label="For You" />
          <Tab label="Trending" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
          Recommended for You
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Based on your reading history and preferences
        </Typography>
        {renderBookGrid(
          userRecommendations,
          loading.userRecommendations,
          error.userRecommendations
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Trending Books
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Popular books that everyone is talking about
        </Typography>
        {renderBookGrid(
          trendingBooks,
          loading.trendingBooks,
          error.trendingBooks
        )}
      </TabPanel>
    </Box>
  );
};

export default BookRecommendations;