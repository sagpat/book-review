// AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  People,
  RateReview,
  Star,
  Book,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  fetchPopularBooks,
  fetchUserActivity,
  fetchReviewStats,
  clearAnalytics,
} from '../../features/analytics/analyticsSlice';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const authToken = localStorage.getItem('token');
  const {
    popularBooks,
    userActivity,
    reviewStats,
    loading,
    error,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    if (authToken) {
      dispatch(fetchPopularBooks({ token: authToken }));
      dispatch(fetchUserActivity({ token: authToken }));
      dispatch(fetchReviewStats({ token: authToken }));
    }

    return () => {
      dispatch(clearAnalytics());
    };
  }, [dispatch, authToken]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderPopularBooks = () => {
    if (loading.popularBooks) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error.popularBooks) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.popularBooks}
        </Alert>
      );
    }

    if (!popularBooks || popularBooks.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No analytics data available.
        </Typography>
      );
    }

    return (
      <List>
        {popularBooks.map((book, index) => (
          <React.Fragment key={book.id}>
            <ListItem
              sx={{ 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 1,
              }}
              onClick={() => handleBookClick(book.id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {book.title}
                    </Typography>
                    <Chip
                      label={`${book.averageRating.toFixed(1)} ⭐`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      by {book.author}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="caption">
                          {book.viewCount} views
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RateReview fontSize="small" color="action" />
                        <Typography variant="caption">
                          {book.reviewCount} reviews
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < popularBooks.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewStats?.ratingDistribution) return null;

    const ratings = [5, 4, 3, 2, 1];
    const totalRatings = Object.values(reviewStats.ratingDistribution).reduce((sum, count) => sum + count, 0);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Rating Distribution
        </Typography>
        {ratings.map((rating) => {
          const count = reviewStats.ratingDistribution[rating] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          
          return (
            <Box key={rating} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {rating} Stars
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {count} ({percentage.toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Overview" />
          <Tab label="Popular Books" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* User Activity Stats */}
          {userActivity && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={userActivity.totalUsers.toLocaleString()}
                  icon={<People />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Users"
                  value={userActivity.activeUsers.toLocaleString()}
                  subtitle="Currently active"
                  icon={<TrendingUp />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="New Users"
                  value={userActivity.newUsersThisWeek.toLocaleString()}
                  subtitle="This week"
                  icon={<People />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg Session"
                  value={`${Math.round(userActivity.averageSessionTime)} min`}
                  subtitle="Session time"
                  icon={<Visibility />}
                  color="warning"
                />
              </Grid>
            </>
          )}

          {/* Review Stats */}
          {reviewStats && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Reviews"
                  value={reviewStats.totalReviews.toLocaleString()}
                  icon={<RateReview />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Average Rating"
                  value={reviewStats.averageRating.toFixed(1)}
                  subtitle="Overall rating"
                  icon={<Star />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Reviews This Week"
                  value={reviewStats.reviewsThisWeek.toLocaleString()}
                  icon={<RateReview />}
                  color="success"
                />
              </Grid>
            </>
          )}

          {/* Loading and Error States */}
          {(loading.userActivity || loading.reviewStats) && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            </Grid>
          )}

          {(error.userActivity || error.reviewStats) && (
            <Grid item xs={12}>
              <Alert severity="error">
                {error.userActivity || error.reviewStats}
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Most Popular Books
        </Typography>
        <Paper sx={{ mt: 2 }}>
          {renderPopularBooks()}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              {reviewStats && renderRatingDistribution()}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Review Statistics
              </Typography>
              {reviewStats && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Reviews:</strong> {reviewStats.totalReviews.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Average Rating:</strong> {reviewStats.averageRating.toFixed(2)} / 5.0
                  </Typography>
                  <Typography variant="body1">
                    <strong>Reviews This Week:</strong> {reviewStats.reviewsThisWeek.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsDashboard;