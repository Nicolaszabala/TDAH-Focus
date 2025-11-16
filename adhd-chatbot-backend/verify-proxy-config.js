/**
 * Verification script to test trust proxy configuration
 * This ensures express-rate-limit can correctly identify client IPs
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Configure trust proxy (CRITICAL for Render.com)
app.set('trust proxy', 1);

// Create a test rate limiter
const testLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to log IP detection
app.use((req, res, next) => {
  console.log('Trust proxy setting:', app.get('trust proxy'));
  console.log('Detected IP:', req.ip);
  console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
  console.log('---');
  next();
});

app.use(testLimiter);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Proxy configuration working correctly',
    detectedIP: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'],
    trustProxySetting: app.get('trust proxy'),
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🧪 TRUST PROXY VERIFICATION SERVER');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Trust proxy enabled:', app.get('trust proxy'));
  console.log('');
  console.log('Test with: curl http://localhost:3001/test');
  console.log('Test with proxy header: curl -H "X-Forwarded-For: 1.2.3.4" http://localhost:3001/test');
  console.log('='.repeat(60));
});
