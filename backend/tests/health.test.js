const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('répond ok quand MongoDB est connecté', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'up' });
  });

  it('renvoie 404 JSON sur une route inconnue', async () => {
    const res = await request(app).get('/api/nexiste-pas');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route introuvable');
  });

  it('renvoie 400 sur un JSON mal formé', async () => {
    const res = await request(app).post('/api/health').set('Content-Type', 'application/json').send('{"x":');
    expect(res.status).toBe(400);
  });
});
