const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');

describe('Sécurité de l’API', () => {
  it('ajoute les en-têtes helmet et masque x-powered-by', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('autorise uniquement l’origine du front en CORS', async () => {
    const ok = await request(app).get('/api/health').set('Origin', env.frontendUrl);
    expect(ok.headers['access-control-allow-origin']).toBe(env.frontendUrl);
    const ko = await request(app).get('/api/health').set('Origin', 'https://site-pirate.example');
    expect(ko.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('valide les entrées de l’inscription', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: '', lastName: 'X', email: 'pas-un-email', password: '123' });
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['firstName', 'email']));
  });

  it('refuse de démarrer sans JWT_SECRET suffisant', () => {
    const saved = env.jwtSecret;
    env.jwtSecret = 'court';
    expect(() => env.assertSecrets()).toThrow(/JWT_SECRET/);
    env.jwtSecret = saved;
    expect(() => env.assertSecrets()).not.toThrow();
  });
});

describe('Limitation des tentatives sur /api/auth', () => {
  it('renvoie 429 après la limite', async () => {
    const express = require('express');
    const rateLimit = require('express-rate-limit');
    const mini = express();
    mini.use(rateLimit({ windowMs: 60000, limit: 2, standardHeaders: 'draft-7', legacyHeaders: false }));
    mini.post('/login', (req, res) => res.sendStatus(401));

    await request(mini).post('/login');
    await request(mini).post('/login');
    const res = await request(mini).post('/login');
    expect(res.status).toBe(429);
  });

  it('applique le limiteur configuré aux routes d’auth', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x' });
    expect(res.headers).toHaveProperty('ratelimit-policy');
  });
});
