const morgan = require('morgan');
const corsLib = require('cors');
const rateLimit = require('express-rate-limit');

const logger = morgan('combined');

/**
 * Parse CORS origins from env
 */
const allowedOrigins = process.env.CORS_ORIGINS ||"http://localhost:3000"
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [];

console.log('✅ CORS Allowed Origins:', allowedOrigins);

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server & tools (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`❌ CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
};

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
