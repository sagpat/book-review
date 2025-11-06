# API Usage Guide

## Quick Start

### API Key Authentication

For development, you can use the plain API key:
```
x-api-key: 284d7d8-2bh5-4p02-9bc6-6mns18qasd49
```

### Example API Calls

#### Register a new user:
```bash
curl -X POST \
  -H "x-api-key: 284d7d8-2bh5-4p02-9bc6-6mns18qasd49" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}' \
  http://localhost:3001/api/auth/register
```

#### Login:
```bash
curl -X POST \
  -H "x-api-key: 284d7d8-2bh5-4p02-9bc6-6mns18qasd49" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  http://localhost:3001/api/auth/login
```

#### Access protected book routes (requires JWT token from login):
```bash
curl -X GET \
  -H "x-api-key: 284d7d8-2bh5-4p02-9bc6-6mns18qasd49" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  http://localhost:3001/api/books
```

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Microservice**: http://localhost:3002
- **Microservice API Docs**: http://localhost:3002/api-docs/
- **Microservice Health**: http://localhost:3002/api/health

## Database

MySQL is running in Docker on localhost:3306
- Database: `mydb`
- Username: `myuser`
- Password: `my1sql1123`