import { Role } from '../models/auth.model';

/** Fabrique un faux JWT (non signé) pour les tests : seul le payload est lu côté front. */
export function fakeJwt(role: Role, expInSeconds = 3600): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + expInSeconds;
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'u1', role, exp })}.signature`;
}
