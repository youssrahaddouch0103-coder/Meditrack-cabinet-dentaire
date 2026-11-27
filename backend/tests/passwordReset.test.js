const request = require('supertest');
const app = require('../src/app');
const mailer = require('../src/services/mailer');
const PasswordResetToken = require('../src/models/PasswordResetToken');
const { createUser } = require('./helpers');

describe('Mot de passe oublié', () => {
  let sent;
  beforeEach(() => {
    sent = [];
    jest.spyOn(mailer, 'sendMail').mockImplementation(async (m) => { sent.push(m); return {}; });
  });
  afterEach(() => jest.restoreAllMocks());

  const tokenFromMail = () => sent[0].text.match(/token=([a-f0-9]{64})/)[1];

  it('envoie un lien puis change le mot de passe', async () => {
    const { user } = await createUser('patient');
    const r1 = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(r1.status).toBe(200);
    expect(sent).toHaveLength(1);

    const token = tokenFromMail();
    const r2 = await request(app).post('/api/auth/reset-password').send({ token, newPassword: 'nouveau-mdp-123' });
    expect(r2.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'nouveau-mdp-123' });
    expect(login.status).toBe(200);

    const replay = await request(app).post('/api/auth/reset-password').send({ token, newPassword: 'encore-un-mdp-1' });
    expect(replay.status).toBe(400);
  });

  it('répond pareil pour un email inconnu, sans envoyer de mail', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'inconnu@example.com' });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it('refuse un lien expiré', async () => {
    const { user } = await createUser('patient');
    await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    await PasswordResetToken.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    const res = await request(app).post('/api/auth/reset-password').send({ token: tokenFromMail(), newPassword: 'nouveau-mdp-123' });
    expect(res.status).toBe(400);
  });
});
