// analyticsSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsApi } from '../../apis/microserviceApi';

interface PopularBook {
  id: number;
  title: string;
  author: string;
  viewCount: number;
  reviewCount: number;
  averageRating: number;
}

interface UserActivity {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  averageSessionTime: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  reviewsThisWeek: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface AnalyticsState {
  popularBooks: PopularBook[];
  userActivity: UserActivity | null;
  reviewStats: ReviewStats | null;
  loading: {
    popularBooks: boolean;
    userActivity: boolean;
    reviewStats: boolean;
  };
  error: {
    popularBooks: string | null;
    userActivity: string | null;
    reviewStats: string | null;
  };
}

const initialState: AnalyticsState = {
  popularBooks: [],
  userActivity: null,
  reviewStats: null,
  loading: {
    popularBooks: false,
    userActivity: false,
    reviewStats: false,
  },
  error: {
    popularBooks: null,
    userActivity: null,
    reviewStats: null,
  },
};

// Async thunks
export const fetchPopularBooks = createAsyncThunk(
  'analytics/fetchPopularBooks',
  async ({ token }: { token?: string }) => {
    const response = await analyticsApi.getPopularBooks(token);
    // Extract data from the nested response structure
    return response?.data || response || [];
  }
);

export const fetchUserActivity = createAsyncThunk(
  'analytics/fetchUserActivity',
  async ({ token }: { token?: string }) => {
    const response = await analyticsApi.getUserActivity(token);
    // Extract data from the nested response structure
    return response?.data || response || {};
  }
);

export const fetchReviewStats = createAsyncThunk(
  'analytics/fetchReviewStats',
  async ({ token }: { token?: string }) => {
    const response = await analyticsApi.getReviewStats(token);
    // Extract data from the nested response structure
    return response?.data || response || {};
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.popularBooks = [];
      state.userActivity = null;
      state.reviewStats = null;
      state.error = {
        popularBooks: null,
        userActivity: null,
        reviewStats: null,
      };
    },
    clearErrors: (state) => {
      state.error = {
        popularBooks: null,
        userActivity: null,
        reviewStats: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Popular Books
    builder
      .addCase(fetchPopularBooks.pending, (state) => {
        state.loading.popularBooks = true;
        state.error.popularBooks = null;
      })
      .addCase(fetchPopularBooks.fulfilled, (state, action: PayloadAction<PopularBook[]>) => {
        state.loading.popularBooks = false;
        state.popularBooks = action.payload;
      })
      .addCase(fetchPopularBooks.rejected, (state, action) => {
        state.loading.popularBooks = false;
        state.error.popularBooks = action.error.message || 'Failed to fetch popular books';
      })
      // User Activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading.userActivity = true;
        state.error.userActivity = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action: PayloadAction<UserActivity>) => {
        state.loading.userActivity = false;
        state.userActivity = action.payload;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading.userActivity = false;
        state.error.userActivity = action.error.message || 'Failed to fetch user activity';
      })
      // Review Stats
      .addCase(fetchReviewStats.pending, (state) => {
        state.loading.reviewStats = true;
        state.error.reviewStats = null;
      })
      .addCase(fetchReviewStats.fulfilled, (state, action: PayloadAction<ReviewStats>) => {
        state.loading.reviewStats = false;
        state.reviewStats = action.payload;
      })
      .addCase(fetchReviewStats.rejected, (state, action) => {
        state.loading.reviewStats = false;
        state.error.reviewStats = action.error.message || 'Failed to fetch review stats';
      });
  },
});

export const { clearAnalytics, clearErrors } = analyticsSlice.actions;
export default analyticsSlice.reducer;