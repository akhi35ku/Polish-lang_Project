const rateLimit = require('express-rate-limit');

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
};

// Global API limiter
const apiLimiter = rateLimit({ ...standardOptions, windowMs: 15 * 60 * 1000, max: 300 });

// Strict limiter for credential endpoints (brute-force protection)
const authLimiter = rateLimit({ ...standardOptions, windowMs: 15 * 60 * 1000, max: 20 });

// Very strict limiter for OTP sending (email bombing protection)
const otpLimiter = rateLimit({ ...standardOptions, windowMs: 15 * 60 * 1000, max: 5 });

module.exports = { apiLimiter, authLimiter, otpLimiter };
