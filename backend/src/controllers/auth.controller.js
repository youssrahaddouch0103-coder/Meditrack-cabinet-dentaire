const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/token');

function authResponse(user) {
  return {
    token: signToken(user),
    tokenType: 'Bearer',
    email: user.email,
    role: user.role,
    user
  };
}

exports.register = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const password = req.body.password ?? req.body.motDePasse;

  if (!password || String(password).length < 8) {
    throw ApiError.badRequest('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (await User.exists({ email: String(email || '').toLowerCase().trim() })) {
    throw ApiError.conflict('Un compte existe déjà avec cet email');
  }

  // L'inscription publique crée toujours un patient : les autres rôles sont attribués par un admin.
  const user = await User.create({ firstName, lastName, email, phone, password, role: 'patient' });
  res.status(201).json(authResponse(user));
};

exports.login = async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = req.body.password ?? req.body.motDePasse;
  if (!email || !password) throw ApiError.badRequest('Email et mot de passe obligatoires');

  const user = await User.findOne({ email }).select('+password');
  const valid = user && user.active && (await user.comparePassword(String(password)));
  if (!valid) throw ApiError.unauthorized('Email ou mot de passe incorrect');

  user.lastLoginAt = new Date();
  await user.save();
  res.json(authResponse(user));
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
