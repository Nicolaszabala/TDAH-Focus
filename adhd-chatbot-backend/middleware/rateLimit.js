const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware to prevent abuse
 *
 * Free tier of Hugging Face has rate limits (~1 request/second)
 * We implement our own limit to protect the API and provide better UX
 */

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 20, // 20 requests per minute per IP
  message: {
    error: 'Too many requests',
    message: 'Has enviado demasiadas consultas. Por favor, espera un momento antes de intentar de nuevo.',
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers

  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.log(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Has enviado demasiadas consultas. Por favor, espera un momento antes de intentar de nuevo.',
      retryAfter: 60,
    });
  },

  // Skip rate limiting for certain IPs (optional)
  skip: (req) => {
    // Skip for localhost in development
    if (process.env.NODE_ENV !== 'production' && req.ip === '::1') {
      return true;
    }
    return false;
  },
});

/**
 * More aggressive rate limiter for expensive operations
 */
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: {
    error: 'Too many requests',
    message: 'Has excedido el límite de consultas. Por favor, espera unos minutos.',
    retryAfter: 300,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  limiter,
  strictLimiter,
};
