const ApiError = require('../utils/ApiError');

/**
 * À placer après `authenticate`. Exemple : router.get('/', authenticate, authorize('admin', 'medecin'), handler)
 * Renvoie 403 si le rôle de l'utilisateur n'est pas dans la liste.
 */
module.exports = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};
