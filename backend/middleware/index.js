const morgan = require('morgan');
const corsLib = require('cors');
const rateLimit = require('express-rate-limit');

const logger = morgan('combined');

/**
 * CORS configuration
 * Allow localhost/127.0.0.1 for all ports (development & docker)
 * Nginx/reverse proxy handles origin validation in production
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server & tools (Postman, curl, nginx proxy)
    if (!origin) return callback(null, true);

    // Allow localhost and 127.0.0.1 for all ports
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow GitHub Codespaces
    if (origin.includes('.app.github.dev')) {
      return callback(null, true);
    }

    // Log and allow other origins for development
    console.log('[CORS] Allowing origin:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

console.log('✅ CORS configured for development/docker deployment');

/**
 * Rate limiter
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS errors explicitly
  if (err.message?.startsWith('❌ CORS blocked')) {
    return res.status(403).json({
      error: {
        code: 'CORS_ERROR',
        message: err.message,
      },
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      details: process.env.NODE_ENV === 'development' ? err.message : {},
    },
  });
};

const cors = corsLib(corsOptions);

module.exports = {
  logger,
  cors,
  limiter,
  errorHandler,
};
