const User = require('../models/User');
const TwoFactorChallenge = require('../models/TwoFactorChallenge');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { signToken } = require('../utils/token');
const twoFactor = require('../services/twoFactor.service');

function authResponse(user) {
  return {
    token: signToken(user),
    tokenType: 'Bearer',
    email: user.email,
    role: user.role,
    user
  };
}

function lockedError(user) {
  const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
  return new ApiError(423, `Compte temporairement bloqué. Réessayez dans ${minutes} min.`);
}

async function completeLogin(user, res) {
  user.lastLoginAt = new Date();
  await user.save();
  res.json(authResponse(user));
}

exports.register = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const password = req.body.password ?? req.body.motDePasse;

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

  const user = await User.findOne({ email }).select('+password');
  const valid = user && user.active && (await user.comparePassword(String(password)));
  if (!valid) throw ApiError.unauthorized('Email ou mot de passe incorrect');
  if (user.isLocked()) throw lockedError(user);

  if (!env.twoFactorEnabled) return completeLogin(user, res);

  const { challengeId } = await twoFactor.startChallenge(user);
  return res.status(202).json({
    twoFactorRequired: true,
    challengeId,
    message: `Un code à 6 chiffres a été envoyé à ${maskEmail(user.email)}. Il expire dans 5 minutes.`
  });
};

exports.verifyTwoFactor = async (req, res) => {
  const { challengeId, code } = req.body;
  const pending = await TwoFactorChallenge.findById(challengeId).populate('user');
  const user = pending && pending.user;
  if (user && user.isLocked()) throw lockedError(user);

  const outcome = await twoFactor.verifyChallenge(challengeId, code, user);
  switch (outcome.result) {
    case 'ok':
      return completeLogin(user, res);
    case 'invalid':
      throw ApiError.unauthorized(`Code incorrect. Il vous reste ${outcome.remaining} essai(s).`);
    case 'locked':
      throw new ApiError(423, 'Trop de codes incorrects. Compte bloqué 15 minutes.');
    default:
      throw ApiError.unauthorized('Code expiré. Reconnectez-vous pour en recevoir un nouveau.');
  }
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}
