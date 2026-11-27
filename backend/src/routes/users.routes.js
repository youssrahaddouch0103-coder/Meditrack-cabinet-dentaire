const router = require('express').Router();
const { body, param, query } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const User = require('../models/User');
const users = require('../controllers/users.controller');

router.use(authenticate, authorize('admin'));

router.get('/', validate([query('role').optional().isIn(User.ROLES).withMessage('Rôle inconnu')]), asyncHandler(users.list));

router.patch(
  '/:id/role',
  validate([param('id').isMongoId().withMessage('Identifiant invalide'), body('role').isIn(User.ROLES).withMessage('Rôle inconnu')]),
  asyncHandler(users.updateRole)
);

router.patch(
  '/:id/active',
  validate([param('id').isMongoId().withMessage('Identifiant invalide'), body('active').isBoolean().withMessage('active doit être un booléen')]),
  asyncHandler(users.setActive)
);

module.exports = router;
