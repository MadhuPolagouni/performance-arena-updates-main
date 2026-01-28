# Single Dockerfile for both backend and frontend
FROM node:20-alpine

WORKDIR /app

# Install nginx and supervisor for process management
RUN apk add --no-cache nginx supervisor curl tini

# ============ BACKEND SETUP ============
# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend code
COPY backend/ .

# ============ FRONTEND SETUP ============
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend code
COPY frontend/ .

# Build frontend
RUN npm run build

# ============ RUNTIME SETUP ============
WORKDIR /app

# Create directories for supervisor and nginx
RUN mkdir -p /var/log/supervisor /var/run/supervisor

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisord.conf

# Copy frontend dist to nginx directory
RUN mkdir -p /usr/share/nginx/html && \
    cp -r frontend/dist/* /usr/share/nginx/html/

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /var/www && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /var/run/nginx && \
    chown -R appuser:appuser /var/log/supervisor

USER appuser

# Expose ports
EXPOSE 8080 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/ || curl -f http://localhost:3000/health || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start supervisor to manage both services
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
