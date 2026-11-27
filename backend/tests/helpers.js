const User = require('../src/models/User');
const { signToken } = require('../src/utils/token');

let counter = 0;

/** Crée un utilisateur du rôle demandé et renvoie { user, token, auth } pour les requêtes. */
async function createUser(role = 'patient', overrides = {}) {
  counter += 1;
  const user = await User.create({
    firstName: 'Test',
    lastName: role,
    email: `${role}${counter}@example.com`,
    password: 'motdepasse123',
    role,
    ...overrides
  });
  const token = signToken(user);
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
}

module.exports = { createUser };
