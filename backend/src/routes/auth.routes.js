const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimit');
const rules = require('../validators/auth.validators');
const auth = require('../controllers/auth.controller');

router.post('/register', authLimiter, validate(rules.register), asyncHandler(auth.register));
router.post('/login', authLimiter, validate(rules.login), asyncHandler(auth.login));
router.post('/2fa/verify', authLimiter, validate(rules.verifyTwoFactor), asyncHandler(auth.verifyTwoFactor));
router.post('/forgot-password', authLimiter, validate(rules.forgotPassword), asyncHandler(auth.forgotPassword));
router.post('/reset-password', authLimiter, validate(rules.resetPassword), asyncHandler(auth.resetPassword));
router.get('/me', authenticate, auth.me);

module.exports = router;
