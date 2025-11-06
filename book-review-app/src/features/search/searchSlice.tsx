// searchSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchApi } from '../../apis/microserviceApi';

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

interface SearchFilters {
  genre?: string;
  author?: string;
  yearRange?: {
    start: number;
    end: number;
  };
  ratingRange?: {
    min: number;
    max: number;
  };
}

interface SearchState {
  searchResults: Book[];
  advancedSearchResults: Book[];
  currentQuery: string;
  currentFilters: SearchFilters | null;
  loading: {
    search: boolean;
    advancedSearch: boolean;
  };
  error: {
    search: string | null;
    advancedSearch: string | null;
  };
}

const initialState: SearchState = {
  searchResults: [],
  advancedSearchResults: [],
  currentQuery: '',
  currentFilters: null,
  loading: {
    search: false,
    advancedSearch: false,
  },
  error: {
    search: null,
    advancedSearch: null,
  },
};

// Async thunks
export const searchBooks = createAsyncThunk(
  'search/searchBooks',
  async ({ query, token }: { query: string; token?: string }) => {
    const response = await searchApi.searchBooks(query, token);
    // Extract the books array from the nested response structure
    const books = response?.data?.books || response || [];
    return { results: books, query };
  }
);

export const advancedSearchBooks = createAsyncThunk(
  'search/advancedSearchBooks',
  async ({ filters, token }: { filters: SearchFilters; token?: string }) => {
    const response = await searchApi.advancedSearch(filters, token);
    // Extract the books array from the nested response structure
    const books = response?.data?.books || response || [];
    return { results: books, filters };
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.advancedSearchResults = [];
      state.currentQuery = '';
      state.currentFilters = null;
      state.error = {
        search: null,
        advancedSearch: null,
      };
    },
    clearErrors: (state) => {
      state.error = {
        search: null,
        advancedSearch: null,
      };
    },
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    setCurrentFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.currentFilters = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Search Books
    builder
      .addCase(searchBooks.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.results;
        state.currentQuery = action.payload.query;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.error.message || 'Search failed';
      })
      // Advanced Search
      .addCase(advancedSearchBooks.pending, (state) => {
        state.loading.advancedSearch = true;
        state.error.advancedSearch = null;
      })
      .addCase(advancedSearchBooks.fulfilled, (state, action) => {
        state.loading.advancedSearch = false;
        state.advancedSearchResults = action.payload.results;
        state.currentFilters = action.payload.filters;
      })
      .addCase(advancedSearchBooks.rejected, (state, action) => {
        state.loading.advancedSearch = false;
        state.error.advancedSearch = action.error.message || 'Advanced search failed';
      });
  },
});

export const { clearSearchResults, clearErrors, setCurrentQuery, setCurrentFilters } = searchSlice.actions;
export default searchSlice.reducer;