const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');

/** Vérifie le JWT « Authorization: Bearer … » et place l'utilisateur dans req.user. */
module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Session invalide ou expirée');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw ApiError.unauthorized('Compte introuvable ou désactivé');

  req.user = user;
  next();
});
