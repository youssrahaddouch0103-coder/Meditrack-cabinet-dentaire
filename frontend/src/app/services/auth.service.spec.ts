import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { fakeJwt } from '../testing/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('enregistre la session quand la connexion renvoie directement un jeton', () => {
    const token = fakeJwt('admin');
    service.login({ email: 'a@b.ma', motDePasse: 'x' }).subscribe();
    http.expectOne('/api/auth/login').flush({ token, tokenType: 'Bearer', email: 'a@b.ma', role: 'admin' });

    expect(service.getToken()).toBe(token);
    expect(service.getUserEmail()).toBe('a@b.ma');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it("n'enregistre rien quand un code 2FA est demandé", () => {
    let res: any;
    service.login({ email: 'a@b.ma', motDePasse: 'x' }).subscribe(r => (res = r));
    http.expectOne('/api/auth/login').flush({ twoFactorRequired: true, challengeId: 'c1', message: 'Code envoyé' });

    expect(res.challengeId).toBe('c1');
    expect(service.getToken()).toBeNull();
  });

  it('valide le code 2FA et enregistre la session avec l’utilisateur', () => {
    const token = fakeJwt('dentiste');
    service.verifyTwoFactor('c1', '123456').subscribe();
    const req = http.expectOne('/api/auth/2fa/verify');
    expect(req.request.body).toEqual({ challengeId: 'c1', code: '123456' });
    req.flush({ token, tokenType: 'Bearer', email: 'm@b.ma', role: 'dentiste', user: { id: 'u1', firstName: 'Tarik', lastName: '', email: 'm@b.ma', role: 'dentiste' } });

    expect(service.getUser()?.firstName).toBe('Tarik');
    expect(service.getRole()).toBe('dentiste');
  });

  it('inscrit un patient et le connecte', () => {
    const token = fakeJwt('patient');
    service.register({ firstName: 'Sara', lastName: '', email: 's@b.ma', password: 'Password123' }).subscribe();
    http.expectOne('/api/auth/register').flush({ token, tokenType: 'Bearer', email: 's@b.ma', role: 'patient' });

    expect(service.hasRole('patient')).toBeTrue();
    expect(service.hasRole('admin', 'dentiste')).toBeFalse();
  });

  it('lit le rôle dans le jeton et pas dans le localStorage', () => {
    localStorage.setItem('cabinet_admin_jwt_token', fakeJwt('patient'));
    localStorage.setItem('meditrack_user', JSON.stringify({ role: 'admin' }));
    expect(service.getRole()).toBe('patient');
  });

  it('considère un jeton expiré comme une déconnexion', () => {
    localStorage.setItem('cabinet_admin_jwt_token', fakeJwt('admin', -60));
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('rejette un jeton mal formé', () => {
    expect(service.isTokenExpired('pas-un-jwt')).toBeTrue();
    localStorage.setItem('cabinet_admin_jwt_token', 'a.b.c');
    expect(service.getRole()).toBeNull();
  });

  it('vide la session à la déconnexion', () => {
    localStorage.setItem('cabinet_admin_jwt_token', fakeJwt('admin'));
    localStorage.setItem('meditrack_user', '{}');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('envoie les demandes de mot de passe oublié et de réinitialisation', () => {
    service.requestPasswordReset('a@b.ma').subscribe();
    expect(http.expectOne('/api/auth/forgot-password').request.body).toEqual({ email: 'a@b.ma' });
    service.resetPassword('tok', 'NewPassword1').subscribe();
    expect(http.expectOne('/api/auth/reset-password').request.body).toEqual({ token: 'tok', newPassword: 'NewPassword1' });
  });
});
