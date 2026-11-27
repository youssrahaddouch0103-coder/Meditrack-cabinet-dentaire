const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

const patient = {
  firstName: 'Sara',
  lastName: 'Amrani',
  email: 'Sara.Amrani@example.com',
  password: 'motdepasse123'
};

describe('Auth', () => {
  describe('POST /api/auth/register', () => {
    it('crée un patient, hache le mot de passe et renvoie un JWT', async () => {
      const res = await request(app).post('/api/auth/register').send(patient);

      expect(res.status).toBe(201);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body).toMatchObject({ tokenType: 'Bearer', email: 'sara.amrani@example.com', role: 'patient' });
      expect(res.body.user.password).toBeUndefined();

      const saved = await User.findOne({ email: 'sara.amrani@example.com' }).select('+password');
      expect(saved.password).not.toBe(patient.password);
      expect(saved.password.startsWith('$2')).toBe(true);
    });

    it("ignore un rôle envoyé par le client", async () => {
      const res = await request(app).post('/api/auth/register').send({ ...patient, role: 'admin' });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe('patient');
    });

    it('refuse un email déjà utilisé', async () => {
      await request(app).post('/api/auth/register').send(patient);
      const res = await request(app).post('/api/auth/register').send(patient);
      expect(res.status).toBe(409);
    });

    it('refuse un mot de passe trop court', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...patient, password: 'court' });
      expect(res.status).toBe(400);
    });

    it('renvoie les erreurs de validation par champ', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'pas-un-email', password: 'motdepasse123' });
      expect(res.status).toBe(400);
      const fields = res.body.details.map((d) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['firstName', 'lastName', 'email']));
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => request(app).post('/api/auth/register').send(patient));

    it('connecte avec les bons identifiants', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: patient.email, password: patient.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    });

    it("accepte l'ancien champ motDePasse du front", async () => {
      const res = await request(app).post('/api/auth/login').send({ email: patient.email, motDePasse: patient.password });
      expect(res.status).toBe(200);
    });

    it('refuse un mauvais mot de passe avec un message générique', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: patient.email, password: 'mauvais-mdp' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('refuse un email inconnu avec le même message', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'inconnu@example.com', password: 'motdepasse123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('refuse un compte désactivé', async () => {
      await User.updateOne({ email: 'sara.amrani@example.com' }, { active: false });
      const res = await request(app).post('/api/auth/login').send({ email: patient.email, password: patient.password });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it("renvoie l'utilisateur connecté", async () => {
      const { body } = await request(app).post('/api/auth/register').send(patient);
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('sara.amrani@example.com');
    });

    it('refuse sans jeton', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('refuse un jeton invalide', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
      expect(res.status).toBe(401);
    });
  });
});
