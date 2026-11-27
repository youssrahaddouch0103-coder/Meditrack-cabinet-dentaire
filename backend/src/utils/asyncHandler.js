/** Transmet les erreurs des contrôleurs async au middleware d'erreurs. */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
