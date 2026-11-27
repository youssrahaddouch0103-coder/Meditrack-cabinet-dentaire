const User = require('../models/User');
const ApiError = require('../utils/ApiError');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).populate('specialty', 'name slug').sort({ lastName: 1, firstName: 1 });
  res.json({ users });
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if (String(req.params.id) === String(req.user.id) && role !== 'admin') {
    throw ApiError.badRequest('Un administrateur ne peut pas retirer son propre rôle admin');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  res.json({ user });
};

exports.setActive = async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    throw ApiError.badRequest('Vous ne pouvez pas désactiver votre propre compte');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { active: Boolean(req.body.active) }, { new: true });
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  res.json({ user });
};
