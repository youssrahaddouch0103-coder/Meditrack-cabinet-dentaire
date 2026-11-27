const crypto = require('crypto');
const PasswordResetToken = require('../models/PasswordResetToken');
const User = require('../models/User');
const env = require('../config/env');
const mailer = require('./mailer');

const TTL_MS = 30 * 60 * 1000;
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

/** Envoie un lien de réinitialisation si le compte existe. Ne révèle jamais si l'email est connu. */
async function requestReset(email) {
  const user = await User.findOne({ email: String(email).toLowerCase().trim(), active: true });
  if (!user) return;
  await PasswordResetToken.deleteMany({ user: user._id });
  const token = crypto.randomBytes(32).toString('hex');
  await PasswordResetToken.create({ user: user._id, tokenHash: hash(token), expiresAt: new Date(Date.now() + TTL_MS) });
  const link = `${env.frontendUrl.split(',')[0].trim()}/admin/reset-password?token=${token}`;
  await mailer.sendMail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe MediTrack',
    text: `Bonjour ${user.firstName},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable 30 minutes) :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
  });
}

/** Change le mot de passe si le jeton est valide. Renvoie false sinon. */
async function resetPassword(token, newPassword) {
  const entry = await PasswordResetToken.findOne({ tokenHash: hash(String(token)) });
  if (!entry || entry.expiresAt < new Date()) return false;
  const user = await User.findById(entry.user);
  if (!user) return false;
  user.password = newPassword;
  user.lockUntil = undefined;
  await user.save();
  await PasswordResetToken.deleteMany({ user: user._id });
  return true;
}

module.exports = { requestReset, resetPassword, TTL_MS };
