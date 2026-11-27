const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** Limite les tentatives sur /api/auth pour freiner la force brute. */
exports.authLimiter = rateLimit({
  windowMs: env.authRateWindowMs,
  limit: env.authRateLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans quelques minutes.' }
});
