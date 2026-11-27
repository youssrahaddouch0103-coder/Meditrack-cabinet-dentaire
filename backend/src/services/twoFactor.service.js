const crypto = require('crypto');
const TwoFactorChallenge = require('../models/TwoFactorChallenge');
const mailer = require('./mailer');

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LOCK_MS = 15 * 60 * 1000;

const hash = (code) => crypto.createHash('sha256').update(code).digest('hex');

/** Crée un code à 6 chiffres, l'envoie par email et renvoie l'identifiant du défi. */
async function startChallenge(user) {
  await TwoFactorChallenge.deleteMany({ user: user._id });
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const challenge = await TwoFactorChallenge.create({
    user: user._id,
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS)
  });
  await mailer.sendMail({
    to: user.email,
    subject: 'Votre code de connexion MediTrack',
    text: `Bonjour ${user.firstName},\n\nVotre code de connexion est : ${code}\nIl expire dans 5 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, changez votre mot de passe.`
  });
  return { challengeId: challenge.id };
}

/**
 * Vérifie le code. Résultats possibles : 'ok', 'invalid', 'expired', 'locked'.
 * Au 3e échec, le défi est supprimé et le compte bloqué 15 minutes.
 */
async function verifyChallenge(challengeId, code, user) {
  const challenge = await TwoFactorChallenge.findById(challengeId);
  if (!challenge || challenge.expiresAt < new Date()) return { result: 'expired' };

  if (crypto.timingSafeEqual(Buffer.from(challenge.codeHash), Buffer.from(hash(String(code))))) {
    await challenge.deleteOne();
    return { result: 'ok', userId: challenge.user };
  }

  challenge.attempts += 1;
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await challenge.deleteOne();
    if (user) {
      user.lockUntil = new Date(Date.now() + LOCK_MS);
      await user.save();
    }
    return { result: 'locked' };
  }
  await challenge.save();
  return { result: 'invalid', remaining: MAX_ATTEMPTS - challenge.attempts };
}

module.exports = { startChallenge, verifyChallenge, CODE_TTL_MS, MAX_ATTEMPTS, LOCK_MS };
