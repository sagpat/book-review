# =======================================
# Book Review Microservice - Production Docker Image  
# =======================================
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./

# Install dependencies (including devDependencies for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY src/ ./src/

# Build TypeScript application
RUN npm run build

# Production stage  
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S microservice -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=microservice:nodejs /app/dist ./dist

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R microservice:nodejs logs

# Set proper ownership for the entire app
RUN chown -R microservice:nodejs /app

# Switch to non-root user
USER microservice

# Expose application port
EXPOSE 3002

# Add comprehensive health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3002/api/health || \
        node -e "const http = require('http'); \
        const options = { host: 'localhost', port: 3002, path: '/api/health', timeout: 3000 }; \
        const req = http.request(options, (res) => { \
            if (res.statusCode === 200) process.exit(0); else process.exit(1); \
        }); \
        req.on('error', () => process.exit(1)); \
        req.end();"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]