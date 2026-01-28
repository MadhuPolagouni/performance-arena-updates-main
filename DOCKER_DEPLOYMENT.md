# Performance Arena - Docker Deployment Guide

## Overview
This guide covers deploying the Performance Arena application using Docker with separate backend and frontend services.

## Files Created

### 1. **Dockerfile.backend**
Multi-stage Dockerfile for the Node.js/Express backend:
- Uses `node:20-alpine` for lightweight image
- Installs dependencies in build stage
- Runs as non-root user (nodejs) for security
- Includes health checks
- Proper signal handling with tini

**Key Features:**
- Production-optimized (only production deps)
- Health checks every 30 seconds
- 40-second startup grace period
- Exposes port 3000

### 2. **Dockerfile.frontend**
Multi-stage Dockerfile for the React/Vite frontend:
- Builds React app in Node.js image
- Serves via Nginx in final stage
- `nginx:alpine` for production serving
- Proxies API requests to backend
- Gzip compression enabled

**Key Features:**
- SPA routing configured
- Static file caching (1 year)
- API proxy to `/api/` endpoint
- Security headers included
- Health checks

### 3. **nginx.conf**
Nginx configuration for frontend serving:
- SPA routing with fallback to index.html
- API reverse proxy to backend service
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compression for assets
- Cache control for static files
- Protection against hidden files

### 4. **docker-compose.yml**
Orchestration file for multi-container deployment:
- Defines both backend and frontend services
- Custom network for inter-service communication
- Dependency ordering (frontend waits for backend)
- Health checks for both services
- Volume mounting for data persistence
- Automatic restart policy
- Environment variable support

### 5. **.env.docker**
Environment configuration template:
- Configurable ports
- Node environment setting
- Placeholders for sensitive data (DB URL, secrets)

### 6. **.dockerignore**
Optimizes build context:
- Excludes node_modules, dist, build artifacts
- Prevents large build contexts

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git repository cloned

### Option 1: Using Docker Compose (Recommended)

```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Visit: http://localhost:8080

### Option 2: Build Images Separately

```bash
# Build backend image
docker build -f Dockerfile.backend -t performance-arena-backend .

# Build frontend image
docker build -f Dockerfile.frontend -t performance-arena-frontend .

# Run backend
docker run -d \
  --name backend \
  -p 3000:3000 \
  -v $(pwd)/backend/data:/app/data \
  performance-arena-backend

# Run frontend
docker run -d \
  --name frontend \
  -p 8080:8080 \
  --link backend:backend \
  performance-arena-frontend
```

## Service Details

### Backend Service
- **Container**: `performance-arena-backend`
- **Port**: 3000
- **Health Check**: Every 30s (40s startup grace)
- **Data Volume**: `./backend/data` → `/app/data`
- **Network**: performance-arena-network

### Frontend Service
- **Container**: `performance-arena-frontend`
- **Port**: 8080
- **Health Check**: Every 30s (10s startup grace)
- **Network**: performance-arena-network
- **Backend URL**: http://backend:3000 (internal)

## Advanced Usage

### Custom Environment Variables

Create `.env` file:
```env
NODE_ENV=production
BACKEND_PORT=3000
FRONTEND_PORT=8080
DATABASE_URL=your_db_url
JWT_SECRET=your_secret_key
```

Run with custom env:
```bash
docker-compose --env-file .env up -d
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs

# Follow backend logs
docker-compose logs -f backend

# Follow frontend logs
docker-compose logs -f frontend

# Specific service status
docker-compose ps

# Resource usage
docker stats
```

### Development Mode

For development, use volume mounts:

```bash
# Add to docker-compose.yml backend service:
volumes:
  - ./backend:/app
  - /app/node_modules

# Then rebuild and run
docker-compose up -d --build
```

## Production Deployment

### Registry/Cloud Deployment

```bash
# Tag images
docker tag performance-arena-backend myregistry/performance-arena-backend:1.0.0
docker tag performance-arena-frontend myregistry/performance-arena-frontend:1.0.0

# Push to registry
docker push myregistry/performance-arena-backend:1.0.0
docker push myregistry/performance-arena-frontend:1.0.0
```

### Kubernetes Deployment

Convert docker-compose to Kubernetes manifests:
```bash
kompose convert -f docker-compose.yml -o k8s/
```

## Troubleshooting

### Backend not starting
```bash
docker-compose logs backend
# Check port 3000 is available
lsof -i :3000
```

### Frontend can't reach backend
```bash
# Verify network connectivity
docker-compose exec frontend ping backend

# Check backend health
docker-compose exec backend curl http://localhost:3000/health
```

### Port already in use
```bash
# Use custom ports in docker-compose
BACKEND_PORT=4000 FRONTEND_PORT=9000 docker-compose up -d
```

### Clear everything and rebuild
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Security Best Practices

✅ **Implemented:**
- Non-root user execution
- Alpine base images (smaller attack surface)
- Health checks (automatic restart on failure)
- Security headers in Nginx
- GZIP compression
- Signal handling with tini

🔒 **Additional Recommendations:**
1. Use secrets management (Docker Secrets for Swarm, K8s Secrets)
2. Enable Docker content trust
3. Scan images for vulnerabilities: `docker scan performance-arena-backend`
4. Use read-only root filesystem where possible
5. Implement rate limiting in Nginx
6. Enable HTTPS/TLS in production
7. Regular image updates and patches

## Performance Optimization

- **Frontend**: Nginx gzip compression, static file caching, SPA routing
- **Backend**: Multi-stage build, minimal dependencies, proper JVM/Node settings
- **Network**: Internal Docker network (no port exposure for inter-service communication)
- **Restart Policy**: Unless-stopped (automatic recovery on crash)

## Cleanup

```bash
# Stop and remove all containers
docker-compose down

# Remove volumes as well
docker-compose down -v

# Remove images
docker rmi performance-arena-backend performance-arena-frontend

# Full cleanup
docker system prune -a --volumes
```

---

**Version**: 1.0  
**Last Updated**: January 28, 2026
