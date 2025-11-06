# Book Review App - Microservice Integration

This document outlines the integration of the new microservice with the existing book review application.

## New Features Added

### 1. Enhanced Search Functionality
- **Location**: `/search` route
- **Component**: `EnhancedBookSearch.tsx`
- **Features**:
  - Advanced filtering by genre, author, publication year, and rating
  - Real-time search with debouncing
  - Improved UI with filter accordions

### 2. Book Recommendations
- **Location**: `/recommendations` route
- **Component**: `BookRecommendations.tsx`
- **Features**:
  - Personalized recommendations based on user history
  - Trending books section
  - Similar books on book detail pages

### 3. Analytics Dashboard
- **Location**: `/analytics` route (Admin only)
- **Component**: `AnalyticsDashboard.tsx`
- **Features**:
  - Popular books analytics
  - User activity metrics
  - Review statistics with rating distribution

### 4. Notification System
- **Component**: `NotificationCenter.tsx`
- **Features**:
  - Real-time notifications
  - Mark as read functionality
  - Notification badge in header

## Technical Implementation

### New API Service
- **File**: `src/apis/microserviceApi.tsx`
- **Purpose**: Handles all communications with the new microservice
- **Endpoints**:
  - Recommendations API
  - Analytics API
  - Search API
  - Notifications API

### Redux Integration
- **Recommendations Slice**: `src/features/recommendations/recommendationsSlice.tsx`
- **Analytics Slice**: `src/features/analytics/analyticsSlice.tsx`
- **Search Slice**: `src/features/search/searchSlice.tsx`
- **Notifications Slice**: `src/features/notifications/notificationsSlice.tsx`

### Environment Configuration
Add the following to your `.env` file:
```
VITE_MICROSERVICE_API_URL=http://localhost:3002/api
```

### Updated Components

#### Header Component
- Added navigation links for new features
- Integrated notification center
- Role-based menu items (analytics for admins only)

#### Book Details Component
- Added "Similar Books" section
- Fetches similar books from microservice
- Enhanced user experience with related content

#### Main Router
- Added new routes for microservice features:
  - `/recommendations`
  - `/search`
  - `/analytics`

## Setup Instructions

### 1. Install Dependencies
```bash
cd book-review-app
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Update the .env file with your actual values
```

### 3. Start the Microservice
```bash
cd ../book-review-recommended-backend
npm install
npm run dev
```

### 4. Start the Frontend
```bash
cd ../book-review-app
npm run dev
```

## API Endpoints Used

### Recommendations
- `GET /api/recommendations/user/{userId}` - Get user recommendations
- `GET /api/recommendations/similar/{bookId}` - Get similar books
- `GET /api/recommendations/trending` - Get trending books

### Analytics
- `GET /api/analytics/books/popular` - Get popular books
- `GET /api/analytics/users/activity` - Get user activity stats
- `GET /api/analytics/reviews/stats` - Get review statistics

### Search
- `GET /api/search/books?q={query}` - Enhanced book search
- `POST /api/search/advanced` - Advanced search with filters

### Notifications
- `GET /api/notifications/user/{userId}` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `GET /api/notifications/user/{userId}/unread-count` - Get unread count

## User Experience Improvements

1. **Enhanced Navigation**: Users can now easily access search, recommendations, and their notifications
2. **Personalization**: The app now provides personalized book recommendations
3. **Better Search**: Advanced filtering options make finding books easier
4. **Admin Insights**: Administrators can view comprehensive analytics
5. **Real-time Updates**: Notification system keeps users informed

## Error Handling

All new features include:
- Loading states with spinner indicators
- Error messages for failed requests
- Graceful degradation when microservice is unavailable
- Retry mechanisms for transient failures

## Performance Considerations

- **Caching**: Redux state management for efficient data access
- **Pagination**: Large result sets are paginated
- **Debouncing**: Search inputs are debounced to reduce API calls
- **Lazy Loading**: Components load data only when needed

## Security

- **Authentication**: All microservice endpoints require valid JWT tokens
- **API Key**: Encrypted API key validation for additional security
- **Role-based Access**: Analytics dashboard restricted to admin users
- **Input Validation**: All user inputs are validated on both client and server

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for instant notifications
2. **Advanced Analytics**: More detailed charts and graphs
3. **Recommendation Engine**: Machine learning-based recommendations
4. **Social Features**: User following and social recommendations
5. **Mobile App**: React Native app using the same microservice APIs

## Troubleshooting

### Common Issues

1. **Microservice not responding**: Ensure the microservice is running on port 3002
2. **Environment variables**: Check that all required environment variables are set
3. **CORS issues**: Verify CORS configuration in the microservice
4. **Authentication errors**: Ensure JWT tokens are valid and not expired

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages and API logs.