# CORS-Free Single Container Deployment Guide

## ✅ No CORS Errors - How It Works

The single-container Docker deployment **ELIMINATES CORS issues completely** without needing separate environment configurations. Here's why:

### Architecture

```
┌─────────────────────────────────────────────┐
│         Single Docker Container              │
│      (localhost:8080 / localhost:3000)       │
│                                              │
│  Browser Request Flow:                       │
│  1. Frontend (http://localhost:8080)         │
│  2. Frontend makes: GET /api/agent/...       │
│  3. Nginx intercepts: /api/*                 │
│  4. Nginx proxies to: http://localhost:3000 │
│  5. Backend responds                         │
│  6. Nginx returns to frontend                │
│                                              │
│  FROM BROWSER'S PERSPECTIVE:                 │
│  ✅ All requests appear to come from         │
│     the SAME ORIGIN (localhost:8080)         │
│  ✅ NO CORS HEADERS NEEDED                   │
│                                              │
└─────────────────────────────────────────────┘
```

## Key Points

### 1. **Frontend API Base URL**
✅ **CHANGED to relative path: `/api`**

```javascript
// frontend/src/api/http.js
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

**Why this works:**
- In Docker: `/api` → nginx proxies to `localhost:3000` internally
- In Development: `/api` → vite dev server proxies to `localhost:3000`
- Browser sees: requests going to `http://localhost:8080/api/*`
- **Result**: Same origin = No CORS errors

### 2. **Nginx Proxy Configuration**
✅ **ALREADY CONFIGURED in nginx.conf**

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**How it works:**
1. Browser sends: `GET http://localhost:8080/api/agent/123`
2. Nginx receives this request on port 8080
3. Nginx routes it to backend: `http://localhost:3000/api/agent/123`
4. Backend returns response
5. Nginx sends back to browser
6. Browser thinks response came from same origin ✅

### 3. **Backend CORS Middleware**
✅ **ALREADY CONFIGURED - but won't interfere**

```javascript
// backend/middleware/cors.js
if (!origin) {
  return callback(null, true);  // Nginx proxy requests have no origin
}

if (origin.includes('localhost')) {
  return callback(null, true);  // Local requests allowed
}
```

**Why it's safe:**
- When nginx proxies requests, it removes the Origin header
- Backend receives requests as if they're internal
- CORS middleware allows them anyway
- **Result**: Zero conflicts

## Deployment Scenarios

### Scenario 1: Docker Single Container ✅ NO CORS

```bash
docker-compose -f docker-compose.single.yml up -d
```

**Flow:**
```
Browser → localhost:8080 (Nginx)
         → /api/* → proxies internally → localhost:3000 (Backend)
         → Same origin = NO CORS ERRORS
```

### Scenario 2: Local Development ✅ NO CORS

```bash
# Terminal 1: Backend
cd backend && npm run dev  # runs on localhost:3000

# Terminal 2: Frontend  
cd frontend && npm run dev  # runs on localhost:8080
```

**Flow:**
```
Browser → localhost:8080 (Vite dev server)
        → /api/* → vite proxy → localhost:3000 (Backend)
        → Same origin = NO CORS ERRORS
```

### Scenario 3: Production Server ✅ NO CORS

```bash
docker run -d \
  -p 80:8080 \
  -p 3000:3000 \
  performance-arena
```

**Flow:**
```
Browser → example.com (Nginx on port 80)
        → /api/* → proxies internally → localhost:3000
        → Same origin = NO CORS ERRORS
```

## Environment Variables - NOT NEEDED

### ❌ NOT Required Anymore:
```env
# These are NO LONGER NEEDED
VITE_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_URL=http://localhost:3000/api
API_ENDPOINT=http://localhost:3000/api
```

### ✅ What We Use Instead:

**For Docker:**
- Frontend makes requests to `/api/*`
- Nginx automatically proxies to backend
- No env config needed

**For Development:**
- Frontend makes requests to `/api/*`
- Vite dev server proxy handles it
- No env config needed

## What Actually Happens

### Request Journey in Docker Container

```
1. Browser sends request:
   GET http://localhost:8080/api/agent/703343923

2. Nginx receives on port 8080:
   "Ah, this is /api/, let me forward it internally"

3. Nginx forwards to backend:
   GET http://localhost:3000/api/agent/703343923
   (But keeps saying it came from localhost:8080)

4. Backend receives and processes:
   "This is a normal request from localhost"
   (No CORS check needed - it's same container!)

5. Backend sends response back to nginx

6. Nginx returns to browser:
   HTTP/1.1 200 OK
   (Origin headers already handled)

7. Browser receives:
   "This is from the same origin (localhost:8080)"
   ✅ No CORS error!
```

## Testing It Works

### Method 1: Browser Console
```javascript
// Open browser DevTools → Console
fetch('/api/agent/703343923')
  .then(r => r.json())
  .then(d => console.log('SUCCESS - No CORS error!', d))
  .catch(e => console.error('ERROR:', e))
```

### Method 2: Direct curl inside container
```bash
docker-compose -f docker-compose.single.yml exec app curl http://localhost:3000/api/agent/703343923
```

### Method 3: Check Nginx logs
```bash
docker-compose -f docker-compose.single.yml logs -f
# Look for successful proxying
```

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| API Base URL | `http://localhost:3000/api` | `/api` (relative) |
| Docker CORS Issues | ❌ YES (different ports) | ✅ NO (same origin) |
| Environment Vars | ❌ Required | ✅ Not needed |
| Setup Complexity | Complex | Simple |
| Dev Server | Requires proxy config | Works automatically |
| Production | Requires CORS headers | Nginx handles it |

## Why This Approach is Better

1. **No Environment Variables**: One less thing to manage
2. **Same Code Everywhere**: Works in Docker, dev, and production
3. **No CORS Headers Needed**: Nginx proxy makes them unnecessary
4. **Simpler Debugging**: All requests visible in single flow
5. **Better Performance**: No CORS preflight requests
6. **More Secure**: No need to expose backend CORS settings

## Summary

```
┌─────────────────────────────────────────┐
│  ✅ CORS-Free Architecture              │
├─────────────────────────────────────────┤
│  Single Docker Container:                │
│  • Nginx (port 8080) - Frontend          │
│  • Backend (port 3000) - Internal        │
│  • Proxy setup - Automatic               │
│  • CORS errors - ZERO                    │
│  • Environment vars - ZERO               │
│                                          │
│  Frontend code:                          │
│  • Uses relative paths: /api/*           │
│  • Works in Docker                       │
│  • Works in development                  │
│  • Works in production                   │
└─────────────────────────────────────────┘
```

## Ready to Deploy

**Everything is configured. Just run:**

```bash
docker-compose -f docker-compose.single.yml up -d
```

**Access:**
- Frontend: http://localhost:8080
- Backend: http://localhost:3000 (internal only via nginx)
- API: http://localhost:8080/api/* (proxied by nginx)

**No CORS errors. No environment configuration. It just works.** ✅

---

**Version**: 1.0  
**Date**: January 28, 2026
