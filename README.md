# 📚 Book Review Application Suite

A comprehensive full-stack book review application with microservice architecture, featuring a React frontend, Node.js backend, and specialized microservice for recommendations and analytics.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐
│   Frontend      │    │   Main Backend   │    │   Microservice          │
│   (React/Vite)  │◄──►│   (Express/SQL)  │◄──►│   (Express/MongoDB)     │
│   Port: 3000    │    │   Port: 3001     │    │   Port: 3002            │
└─────────────────┘    └──────────────────┘    └─────────────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
    Web Browser              MySQL Database          MongoDB + Redis
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- MySQL 8.0+
- MongoDB 5.0+
- Redis 6.0+ (optional, for caching)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd book-review
chmod +x *.sh
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp book-review-app/.env.example book-review-app/.env
cp book-review-backend/.env.example book-review-backend/.env
cp book-review-recommended-backend/.env.example book-review-recommended-backend/.env

# Edit .env files with your configuration
```

### 3. Start All Services
```bash
# Option 1: Use the automated script (recommended)
./start-services.sh

# Option 2: Start services individually
cd book-review-backend && npm run dev &
cd book-review-recommended-backend && npm run dev &
cd book-review-app && npm run dev &
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Main API**: http://localhost:3001
- **Microservice API**: http://localhost:3002
- **API Documentation**: http://localhost:3002/api-docs (if Swagger enabled)

## 📁 Project Structure

```
book-review/
├── 📱 book-review-app/              # React Frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── store/                  # Redux store
│   │   ├── apis/                   # API integration
│   │   └── pages/                  # Page components
│   ├── .env                        # Frontend configuration
│   └── package.json
│
├── 🔧 book-review-backend/          # Main Backend API
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── models/                 # Database models
│   │   ├── routes/                 # API routes
│   │   └── middlewares/            # Custom middleware
│   ├── .env                        # Backend configuration
│   └── package.json
│
├── 🎯 book-review-recommended-backend/ # Microservice
│   ├── src/
│   │   ├── controllers/            # Business logic
│   │   ├── services/               # Core services
│   │   ├── routes/                 # API endpoints
│   │   └── models/                 # Data models
│   ├── .env                        # Microservice configuration
│   └── package.json
│
├── 🐳 docker-compose.yml           # Docker orchestration
├── 📜 start-services.sh            # Service startup script
└── 📖 README.md                    # This file
```

## 🔧 Development

### Frontend Development (React + TypeScript)
```bash
cd book-review-app
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

### Backend Development (Node.js + TypeScript)
```bash
cd book-review-backend
npm install
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run type-check   # TypeScript check
```

### Microservice Development
```bash
cd book-review-recommended-backend
npm install
npm run dev          # Start with hot reload
npm run test         # Run Jest tests
npm run lint         # Run ESLint
npm run health       # Health check endpoint
```

## 🌟 Features

### Core Features
- ✅ User authentication and authorization
- ✅ Book management (CRUD operations)
- ✅ Review and rating system
- ✅ Real-time notifications
- ✅ Advanced search and filtering
- ✅ Personalized recommendations
- ✅ Analytics dashboard

### Technical Features
- 🔒 JWT-based authentication
- 🛡️ Role-based access control
- 📊 Redux state management
- 🎨 Material-UI components
- 🔄 Real-time data updates
- 📱 Responsive design
- 🚀 Performance optimization
- 🧪 Comprehensive error handling

## 🔗 API Endpoints

### Main Backend (Port 3001)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books` - Get all books
- `POST /api/books` - Create book
- `GET /api/books/:id` - Get book details
- `POST /api/reviews` - Create review

### Microservice (Port 3002)
- `GET /api/recommendations/:userId` - Get personalized recommendations
- `GET /api/analytics/dashboard` - Analytics data
- `GET /api/notifications/:userId` - User notifications  
- `POST /api/search/advanced` - Advanced search
- `GET /api/health` - Service health check

## 🐳 Docker Deployment (Local Development)

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down
```

## ☁️ Azure Cloud Deployment

Deploy to Azure with automated CI/CD using GitHub Actions and Terraform:

### 🚀 **Automated Deployment (Recommended)**
```bash
# 1. Setup GitHub Secrets (one-time)
# See CI_CD_SETUP.md for detailed instructions

# 2. Configure Terraform variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit with your Azure settings

# 3. Push to main branch - automatic deployment!
git add .
git commit -m "Deploy to Azure"
git push origin main
```

### 🔧 **Manual Deployment**
```bash
# Navigate to Terraform directory
cd terraform/

# Deploy infrastructure
terraform init
terraform plan
terraform apply

# Applications deploy automatically via GitHub Actions
```

**Features:**
- 🏗️ **Infrastructure as Code** with Terraform
- 🤖 **Automated CI/CD** with GitHub Actions
- � **Container Registry** with automatic image building
- �🚀 **Azure Kubernetes Service (AKS)** for backend services
- 🌐 **Azure App Service** for React frontend
- 🔒 **NGINX Ingress Controller** with SSL automation
- 🗄️ **Azure Database for MySQL** + **Cosmos DB**
- 🔐 **Azure Key Vault** for secrets management
- 📊 **Application Insights** for monitoring

**Documentation:**
- 📖 **Terraform Guide**: [`terraform/README.md`](terraform/README.md)
- 🚀 **CI/CD Setup**: [`CI_CD_SETUP.md`](CI_CD_SETUP.md)
- 🏗️ **Architecture**: [`AZURE_DEPLOYMENT_PLAN.md`](AZURE_DEPLOYMENT_PLAN.md)

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_REACT_APP_API_URL=http://localhost:3001
VITE_MICROSERVICE_API_URL=http://localhost:3002/api
VITE_REACT_APP_ENCRYPTION_KEY=your-encryption-key
VITE_ENABLE_ANALYTICS=true
```

#### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=book_review
JWT_SECRET=your-jwt-secret
```

#### Microservice (.env)
```bash
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/book_review_microservice
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-microservice-jwt-secret
```

## 🧪 Testing

```bash
# Frontend tests
cd book-review-app
npm test

# Backend tests  
cd book-review-backend
npm test

# Microservice tests
cd book-review-recommended-backend
npm run test
npm run test:coverage
```

## 📈 Performance

- **Build optimization**: Vite for fast builds and HMR
- **Code splitting**: Lazy loading for optimal bundle size  
- **Caching**: Redis caching for microservice responses
- **Database optimization**: Proper indexing and queries
- **Asset optimization**: Image compression and lazy loading

## 🛡️ Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Environment-based configuration
- Helmet.js security headers

## 📚 Documentation

- [Frontend Documentation](./book-review-app/README.md)
- [Backend API Documentation](./book-review-backend/README.md)  
- [Microservice Documentation](./book-review-recommended-backend/README.md)
- [Docker Setup Guide](./DOCKER_SETUP.md)
- [Microservice Integration](./MICROSERVICE_INTEGRATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's running on ports
lsof -i :3000
lsof -i :3001  
lsof -i :3002

# Kill processes if needed
kill -9 <PID>
```

**Database connection issues:**
```bash
# Check MySQL status
brew services list | grep mysql

# Start MySQL
brew services start mysql
```

**Environment issues:**
```bash
# Verify environment files exist
ls -la */.env

# Check environment loading
npm run dev -- --verbose
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting guide

---

**Happy coding! 🚀**