# Performance Arena - Single Container Docker Deployment Guide

## Overview
This guide covers deploying the entire Performance Arena application (backend + frontend) as a single Docker container with both services managed by Supervisor.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Docker Container                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │            Supervisor (Process Manager)                ││
│  │                                                        ││
│  │  ┌──────────────────┐        ┌──────────────────┐   ││
│  │  │      Nginx       │        │   Node.js Backend││   ││
│  │  │   (Port 8080)    │────────│   (Port 3000)    │   ││
│  │  │  - Serves React  │        │  - Express API   │   ││
│  │  │  - Proxies /api/ │        │  - Data Services │   ││
│  │  └──────────────────┘        └──────────────────┘   ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  Data Volumes:                                               │
│  - backend/data (mounted)                                    │
│  - logs (mounted)                                            │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. **Dockerfile**
Single comprehensive Dockerfile that:
- Uses `node:20-alpine` as base
- Installs Nginx and Supervisor
- Builds backend Node.js dependencies
- Builds React frontend with Vite
- Configures both services to run together
- Uses non-root user for security
- Includes health checks

**Build Process:**
1. Install nginx, supervisor, curl, tini
2. Copy and install backend dependencies
3. Copy and install frontend dependencies
4. Build frontend with `npm run build`
5. Copy nginx and supervisor configs
6. Deploy frontend dist to nginx
7. Set up permissions and user

### 2. **supervisord.conf**
Process manager configuration:
- Manages both Nginx and Node.js processes
- Logs to stdout (Docker-friendly)
- Auto-restarts failed processes
- Groups services together
- Proper signal handling

**Processes:**
- `nginx`: Web server (port 8080)
- `nodejs`: Express backend (port 3000)

### 3. **docker-compose.single.yml**
Single-service docker-compose:
- Builds from Dockerfile
- Exposes both ports (8080, 3000)
- Volume mounts for data and logs
- Health checks
- Resource limits (optional)
- Auto-restart policy

### 4. **nginx.conf** (Updated)
Nginx configuration modified for single container:
- Changed backend proxy from `http://backend:3000` to `http://localhost:3000`
- Everything else remains the same

## Quick Start

### Option 1: Using docker-compose (Recommended)

```bash
# Start the application
docker-compose -f docker-compose.single.yml up -d

# View logs
docker-compose -f docker-compose.single.yml logs -f

# Check status
docker-compose -f docker-compose.single.yml ps

# Stop the application
docker-compose -f docker-compose.single.yml down
```

### Option 2: Build and Run Manually

```bash
# Build the image
docker build -t performance-arena .

# Run the container
docker run -d \
  --name performance-arena \
  -p 8080:8080 \
  -p 3000:3000 \
  -v $(pwd)/backend/data:/app/backend/data \
  -v $(pwd)/logs:/var/log/supervisor \
  performance-arena

# View logs
docker logs -f performance-arena

# Stop the container
docker stop performance-arena
docker rm performance-arena
```

## Access Points

Once running:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:8080/health (via proxy to backend)

## Configuration

### Environment Variables

Create `.env` file:
```env
NODE_ENV=production
FRONTEND_PORT=8080
BACKEND_PORT=3000
# Add other variables:
# DATABASE_URL=your_db_url
# JWT_SECRET=your_secret
```

Run with custom env:
```bash
docker-compose -f docker-compose.single.yml --env-file .env up -d
```

### Resource Limits

Edit `docker-compose.single.yml` to adjust:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'        # Max 2 CPUs
      memory: 2G       # Max 2GB RAM
    reservations:
      cpus: '1'        # Reserve 1 CPU
      memory: 1G       # Reserve 1GB RAM
```

## Monitoring and Logs

### View All Logs
```bash
docker-compose -f docker-compose.single.yml logs
```

### Follow Logs in Real-time
```bash
docker-compose -f docker-compose.single.yml logs -f
```

### View Last 100 Lines
```bash
docker-compose -f docker-compose.single.yml logs --tail=100
```

### Check Service Health
```bash
# Check container status
docker-compose -f docker-compose.single.yml ps

# Detailed inspection
docker-compose -f docker-compose.single.yml ps --verbose
```

### Check Process Status Inside Container
```bash
# View supervisor status
docker-compose -f docker-compose.single.yml exec app supervisorctl status

# View nginx status
docker-compose -f docker-compose.single.yml exec app supervisorctl status nginx

# View nodejs status
docker-compose -f docker-compose.single.yml exec app supervisorctl status nodejs
```

## Development Workflow

For development with live reload:

### Option 1: Keep docker-compose for production, use npm for development
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Option 2: Modify Dockerfile for development
Create `Dockerfile.dev`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache nginx supervisor

# Copy both projects
COPY backend backend
COPY frontend frontend

# Install dependencies (no build)
WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

# Copy configs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# Expose ports
EXPOSE 8080 3000 5173

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
```

Build and run:
```bash
docker build -f Dockerfile.dev -t performance-arena:dev .
docker run -d \
  --name performance-arena-dev \
  -p 8080:8080 \
  -p 3000:3000 \
  -p 5173:5173 \
  -v $(pwd)/backend:/app/backend \
  -v $(pwd)/frontend:/app/frontend \
  performance-arena:dev
```

## Troubleshooting

### Container fails to start
```bash
# Check logs
docker-compose -f docker-compose.single.yml logs

# Common issues:
# - Port already in use: lsof -i :8080 or lsof -i :3000
# - Missing dependencies: rebuild with --no-cache
docker-compose -f docker-compose.single.yml up -d --build --no-cache
```

### Nginx not serving frontend
```bash
# Check if frontend built properly
docker-compose -f docker-compose.single.yml exec app ls -la /usr/share/nginx/html

# Restart nginx
docker-compose -f docker-compose.single.yml exec app supervisorctl restart nginx
```

### Backend API not responding
```bash
# Check backend logs
docker-compose -f docker-compose.single.yml exec app supervisorctl tail -100 nodejs

# Restart backend
docker-compose -f docker-compose.single.yml exec app supervisorctl restart nodejs
```

### Port conflicts
```bash
# Find what's using the port
lsof -i :8080
lsof -i :3000

# Run on different ports
FRONTEND_PORT=9000 BACKEND_PORT=4000 \
  docker-compose -f docker-compose.single.yml up -d
```

### Permission issues
```bash
# Rebuild with clean state
docker-compose -f docker-compose.single.yml down -v
docker system prune -a
docker-compose -f docker-compose.single.yml up -d --build
```

## Production Deployment

### 1. Build and Tag Image
```bash
docker build -t myregistry/performance-arena:1.0.0 .
docker push myregistry/performance-arena:1.0.0
```

### 2. Deploy to Server
```bash
docker pull myregistry/performance-arena:1.0.0
docker run -d \
  --name performance-arena \
  -p 8080:8080 \
  -p 3000:3000 \
  -v /data/backend:/app/backend/data \
  -v /logs:/var/log/supervisor \
  --restart unless-stopped \
  myregistry/performance-arena:1.0.0
```

### 3. Docker Swarm
```bash
docker service create \
  --name performance-arena \
  --publish 8080:8080 \
  --publish 3000:3000 \
  --mount type=bind,source=/data/backend,target=/app/backend/data \
  --restart-condition on-failure \
  myregistry/performance-arena:1.0.0
```

### 4. Docker Secrets (for sensitive data)
```bash
# Create secrets
echo "your_jwt_secret" | docker secret create jwt_secret -
echo "your_db_url" | docker secret create db_url -

# Use in service
docker service create \
  --secret jwt_secret \
  --secret db_url \
  # ... rest of config
```

## Security Best Practices

✅ **Implemented:**
- Non-root user execution (appuser)
- Alpine base image (minimal attack surface)
- Health checks (auto-restart on failure)
- Security headers in Nginx
- Process isolation via supervisor
- Signal handling with tini

🔒 **Additional Recommendations:**
1. Use environment variables for secrets (not hardcoded)
2. Enable Docker content trust
3. Scan image for vulnerabilities: `docker scan performance-arena`
4. Use read-only root filesystem where possible
5. Implement rate limiting in Nginx
6. Enable HTTPS/TLS in production
7. Regular image updates and patches
8. Use secrets management (Docker Secrets, Vault)

## Performance Optimization

- **Smaller Image**: Alpine base (reduced from ~1GB to ~200MB)
- **Multi-stage concepts**: Only production dependencies
- **Caching**: Nginx caches static files (1 year)
- **Compression**: Gzip enabled on assets
- **Process Management**: Supervisor ensures both services always run
- **Resource Limits**: Can be configured in docker-compose

Estimated image size: ~300-400MB

## Backup and Restore

### Backup Data
```bash
docker-compose -f docker-compose.single.yml exec app \
  tar czf - -C /app/backend data | \
  gzip > backup_$(date +%Y%m%d_%H%M%S).tar.gz
```

### Restore Data
```bash
docker-compose -f docker-compose.single.yml exec -T app \
  tar xzf - -C /app/backend < backup_20260128_120000.tar.gz
```

## Cleanup

```bash
# Stop and remove container
docker-compose -f docker-compose.single.yml down

# Remove volumes as well
docker-compose -f docker-compose.single.yml down -v

# Remove image
docker rmi performance-arena

# Full cleanup
docker system prune -a --volumes
```

## Comparing Approaches

| Feature | Multi-Container | Single Container |
|---------|----------------|------------------|
| Scalability | Better (scale separately) | Limited |
| Resource Efficiency | Lower (more overhead) | Higher |
| Deployment | More complex | Simpler |
| Development | Easier debugging | Harder debugging |
| Troubleshooting | More granular | Less granular |
| Recommended For | Production | Small deployments |

---

**Version**: 1.0  
**Last Updated**: January 28, 2026  
**Recommended**: Use this single-container approach for small to medium deployments. For larger production systems, use multi-container with Docker Compose or Kubernetes.
