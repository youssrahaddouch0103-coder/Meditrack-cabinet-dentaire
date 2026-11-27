const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers');

describe('Rôles', () => {
  it('refuse /api/users aux non-admins avec 403', async () => {
    for (const role of ['patient', 'medecin', 'infirmier', 'pharmacien']) {
      const { auth } = await createUser(role);
      const res = await request(app).get('/api/users').set(auth);
      expect(res.status).toBe(403);
    }
  });

  it('refuse /api/users sans connexion avec 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('laisse un admin lister et filtrer les utilisateurs', async () => {
    const { auth } = await createUser('admin');
    await createUser('medecin');
    await createUser('patient');
    const all = await request(app).get('/api/users').set(auth);
    expect(all.status).toBe(200);
    expect(all.body.users).toHaveLength(3);
    const doctors = await request(app).get('/api/users?role=medecin').set(auth);
    expect(doctors.body.users).toHaveLength(1);
  });

  it('laisse un admin attribuer un rôle', async () => {
    const { auth } = await createUser('admin');
    const { user } = await createUser('patient');
    const res = await request(app).patch(`/api/users/${user.id}/role`).set(auth).send({ role: 'infirmier' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('infirmier');
  });

  it('refuse un rôle inconnu', async () => {
    const { auth } = await createUser('admin');
    const { user } = await createUser('patient');
    const res = await request(app).patch(`/api/users/${user.id}/role`).set(auth).send({ role: 'pirate' });
    expect(res.status).toBe(400);
  });

  it("empêche un admin de retirer son propre rôle ou de se désactiver", async () => {
    const { user, auth } = await createUser('admin');
    const r1 = await request(app).patch(`/api/users/${user.id}/role`).set(auth).send({ role: 'patient' });
    expect(r1.status).toBe(400);
    const r2 = await request(app).patch(`/api/users/${user.id}/active`).set(auth).send({ active: false });
    expect(r2.status).toBe(400);
  });

  it('un compte désactivé ne peut plus utiliser son jeton', async () => {
    const admin = await createUser('admin');
    const patient = await createUser('patient');
    await request(app).patch(`/api/users/${patient.user.id}/active`).set(admin.auth).send({ active: false });
    const res = await request(app).get('/api/auth/me').set(patient.auth);
    expect(res.status).toBe(401);
  });
});
