const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, ...(err.details && { details: err.details }) });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ message: 'Données invalides', details });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Identifiant invalide : ${err.value}` });
  }

  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    return res.status(409).json({ message: `Valeur déjà utilisée pour ${field}` });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalide' });
  }

  if (!env.isTest) console.error(err);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
};
