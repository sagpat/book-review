// recommendationsSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { recommendationsApi } from '../../apis/microserviceApi';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  thumbnail?: string;
  overallRating: number;
  genre?: string;
  publishedYear?: number;
}

interface RecommendationsState {
  userRecommendations: Book[];
  similarBooks: Book[];
  trendingBooks: Book[];
  loading: {
    userRecommendations: boolean;
    similarBooks: boolean;
    trendingBooks: boolean;
  };
  error: {
    userRecommendations: string | null;
    similarBooks: string | null;
    trendingBooks: string | null;
  };
}

const initialState: RecommendationsState = {
  userRecommendations: [],
  similarBooks: [],
  trendingBooks: [],
  loading: {
    userRecommendations: false,
    similarBooks: false,
    trendingBooks: false,
  },
  error: {
    userRecommendations: null,
    similarBooks: null,
    trendingBooks: null,
  },
};

// Async thunks
export const fetchUserRecommendations = createAsyncThunk(
  'recommendations/fetchUserRecommendations',
  async ({ userId, limit, token }: { userId: string; limit?: number; token?: string }) => {
    const response = await recommendationsApi.getUserRecommendations(userId, limit, token);
    // Extract the recommendations array from the nested response structure
    return response?.data?.recommendations || response || [];
  }
);

export const fetchSimilarBooks = createAsyncThunk(
  'recommendations/fetchSimilarBooks',
  async ({ bookId, token }: { bookId: string; token?: string }) => {
    const response = await recommendationsApi.getSimilarBooks(bookId, token);
    // Extract the similarBooks array from the nested response structure
    return response?.data?.similarBooks || response || [];
  }
);

export const fetchTrendingBooks = createAsyncThunk(
  'recommendations/fetchTrendingBooks',
  async ({ token }: { token?: string }) => {
    const response = await recommendationsApi.getTrendingBooks(token);
    // Extract the trendingBooks array from the nested response structure
    return response?.data?.trendingBooks || response || [];
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.userRecommendations = [];
      state.similarBooks = [];
      state.trendingBooks = [];
      state.error = {
        userRecommendations: null,
        similarBooks: null,
        trendingBooks: null,
      };
    },
    clearErrors: (state) => {
      state.error = {
        userRecommendations: null,
        similarBooks: null,
        trendingBooks: null,
      };
    },
  },
  extraReducers: (builder) => {
    // User Recommendations
    builder
      .addCase(fetchUserRecommendations.pending, (state) => {
        state.loading.userRecommendations = true;
        state.error.userRecommendations = null;
      })
      .addCase(fetchUserRecommendations.fulfilled, (state, action: PayloadAction<Book[]>) => {
        state.loading.userRecommendations = false;
        state.userRecommendations = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserRecommendations.rejected, (state, action) => {
        state.loading.userRecommendations = false;
        state.error.userRecommendations = action.error.message || 'Failed to fetch user recommendations';
        state.userRecommendations = []; // Ensure it's always an array
      })
      // Similar Books
      .addCase(fetchSimilarBooks.pending, (state) => {
        state.loading.similarBooks = true;
        state.error.similarBooks = null;
      })
      .addCase(fetchSimilarBooks.fulfilled, (state, action: PayloadAction<Book[]>) => {
        state.loading.similarBooks = false;
        state.similarBooks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSimilarBooks.rejected, (state, action) => {
        state.loading.similarBooks = false;
        state.error.similarBooks = action.error.message || 'Failed to fetch similar books';
        state.similarBooks = []; // Ensure it's always an array
      })
      // Trending Books
      .addCase(fetchTrendingBooks.pending, (state) => {
        state.loading.trendingBooks = true;
        state.error.trendingBooks = null;
      })
      .addCase(fetchTrendingBooks.fulfilled, (state, action: PayloadAction<Book[]>) => {
        state.loading.trendingBooks = false;
        state.trendingBooks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTrendingBooks.rejected, (state, action) => {
        state.loading.trendingBooks = false;
        state.error.trendingBooks = action.error.message || 'Failed to fetch trending books';
        state.trendingBooks = []; // Ensure it's always an array
      });
  },
});

export const { clearRecommendations, clearErrors } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;