# Dockerfile for frontend
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Accept build arguments
ARG VITE_REACT_APP_API_URL
ARG VITE_MICROSERVICE_API_URL
ARG VITE_REACT_APP_ENCRYPTION_KEY
ARG VITE_BOOK_APP_BE_MS_API_KEY

# Set environment variables from build args
ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL
ENV VITE_MICROSERVICE_API_URL=$VITE_MICROSERVICE_API_URL
ENV VITE_REACT_APP_ENCRYPTION_KEY=$VITE_REACT_APP_ENCRYPTION_KEY
ENV VITE_BOOK_APP_BE_MS_API_KEY=$VITE_BOOK_APP_BE_MS_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application with environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]