const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const TwoFactorChallenge = require('../src/models/TwoFactorChallenge');
const twoFactor = require('../src/services/twoFactor.service');
const mailer = require('../src/services/mailer');
const { createUser } = require('./helpers');

describe('Connexion avec code 2FA', () => {
  let sent;

  beforeEach(() => {
    env.twoFactorEnabled = true;
    sent = [];
    jest.spyOn(mailer, 'sendMail').mockImplementation(async (mail) => {
      sent.push(mail);
      return {};
    });
  });

  afterEach(() => {
    env.twoFactorEnabled = false;
    jest.restoreAllMocks();
  });

  async function login(email) {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'motdepasse123' });
    const code = sent.length ? sent[sent.length - 1].text.match(/(\d{6})/)[1] : null;
    return { res, code };
  }

  it('demande un code au lieu de renvoyer un jeton', async () => {
    const { user } = await createUser('patient');
    const { res, code } = await login(user.email);
    expect(res.status).toBe(202);
    expect(res.body.twoFactorRequired).toBe(true);
    expect(res.body.token).toBeUndefined();
    expect(code).toMatch(/^\d{6}$/);
    expect(sent[0].to).toBe(user.email);
  });

  it('renvoie le jeton avec le bon code, une seule fois', async () => {
    const { user } = await createUser('patient');
    const { res, code } = await login(user.email);
    const ok = await request(app).post('/api/auth/2fa/verify').send({ challengeId: res.body.challengeId, code });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toEqual(expect.any(String));
    const replay = await request(app).post('/api/auth/2fa/verify').send({ challengeId: res.body.challengeId, code });
    expect(replay.status).toBe(401);
  });

  it('refuse un code expiré (5 min)', async () => {
    const { user } = await createUser('patient');
    const { res, code } = await login(user.email);
    await TwoFactorChallenge.updateOne({ _id: res.body.challengeId }, { expiresAt: new Date(Date.now() - 1000) });
    const ko = await request(app).post('/api/auth/2fa/verify').send({ challengeId: res.body.challengeId, code });
    expect(ko.status).toBe(401);
    expect(ko.body.message).toMatch(/expiré/);
  });

  it('bloque le compte après 3 codes faux', async () => {
    const { user } = await createUser('patient');
    const { res, code } = await login(user.email);
    const wrong = code === '000000' ? '111111' : '000000';
    const send = (c) => request(app).post('/api/auth/2fa/verify').send({ challengeId: res.body.challengeId, code: c });

    expect((await send(wrong)).body.message).toMatch(/2 essai/);
    expect((await send(wrong)).body.message).toMatch(/1 essai/);
    expect((await send(wrong)).status).toBe(423);

    const again = await login(user.email);
    expect(again.res.status).toBe(423);

    const saved = await User.findById(user.id);
    expect(saved.lockUntil.getTime()).toBeGreaterThan(Date.now() + twoFactor.LOCK_MS - 5000);
  });

  it('rejette un code mal formé', async () => {
    const { user } = await createUser('patient');
    const { res } = await login(user.email);
    const ko = await request(app).post('/api/auth/2fa/verify').send({ challengeId: res.body.challengeId, code: '12ab' });
    expect(ko.status).toBe(400);
  });
});
