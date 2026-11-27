const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  // MongoDB supprime automatiquement le document une fois expiré
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

module.exports = mongoose.model('TwoFactorChallenge', challengeSchema);
