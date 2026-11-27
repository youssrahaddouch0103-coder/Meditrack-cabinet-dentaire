const { validationResult } = require('express-validator');

/** Renvoie 400 avec le détail par champ si une règle express-validator échoue. */
module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const details = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ message: 'Données invalides', details });
  }
];
