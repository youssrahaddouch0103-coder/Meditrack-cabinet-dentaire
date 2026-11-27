const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const auth = require('../controllers/auth.controller');

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.get('/me', authenticate, auth.me);

module.exports = router;
