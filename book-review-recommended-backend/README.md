# Book Review Microservice

A Node.js/TypeScript backend microservice providing recommendations, analytics, notifications, and enhanced search capabilities for the book review application.

## 🚀 Features

- **Book Recommendations**: Personalized book recommendations using ML algorithms
- **Analytics & Reporting**: User activity, popular books, and review statistics
- **Notification Service**: Real-time notifications for user activities
- **Enhanced Search**: Advanced search with filters and suggestions
- **User Activity Tracking**: Comprehensive user behavior analytics

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT tokens
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Testing**: Jest
- **Code Quality**: ESLint, TypeScript strict mode

## 📁 Project Structure

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── models/          # Database models and schemas
├── middleware/      # Custom middleware (auth, logging, etc.)
├── routes/          # API route definitions
├── utils/           # Helper functions and utilities
├── config/          # Configuration files
└── types/           # TypeScript type definitions
```

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-microservice
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/book-review-microservice
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/health

## 🔐 Authentication

All API endpoints (except `/health` and `/api-docs`) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 API Endpoints

### Recommendations
- `GET /api/recommendations/user/{userId}` - Get personalized recommendations
- `GET /api/recommendations/similar/{bookId}` - Get similar books
- `GET /api/recommendations/trending` - Get trending books

### Analytics
- `GET /api/analytics/books/popular` - Popular books analytics
- `GET /api/analytics/users/activity` - User activity statistics
- `GET /api/analytics/reviews/stats` - Review statistics

### Notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/user/{userId}` - Get user notifications

### Search
- `GET /api/search/books` - Enhanced book search
- `POST /api/search/advanced` - Advanced search with filters

### Health
- `GET /api/health` - Service health check

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t book-review-microservice .

# Run with Docker Compose
docker-compose up
```

## 📊 Monitoring & Logging

- **Logs**: Stored in `logs/` directory
- **Health Check**: Available at `/api/health`
- **Metrics**: Integration ready for Prometheus/Grafana

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Book Review Frontend](../book-review-app) - React frontend application
- [Book Review Backend](../book-review-backend) - Main backend API

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

Update for pipeline.