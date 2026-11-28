import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { roleGuard } from './role.guard';
import { fakeJwt } from '../testing/jwt';
import { Role } from '../models/auth.model';

describe('roleGuard', () => {
  let router: Router;

  const run = (roles?: Role[], url = '/admin/equipe') =>
    TestBed.runInInjectionContext(() =>
      roleGuard({ data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    );

  const loginAs = (role: Role) => localStorage.setItem('cabinet_admin_jwt_token', fakeJwt(role));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('renvoie vers la connexion avec returnUrl si personne n’est connecté', () => {
    const res = run(['admin']) as UrlTree;
    expect(router.serializeUrl(res)).toBe('/admin/connexion?returnUrl=%2Fadmin%2Fequipe');
  });

  it('laisse passer un rôle autorisé', () => {
    loginAs('admin');
    expect(run(['admin'])).toBeTrue();
  });

  it('renvoie un membre du personnel non autorisé vers le tableau de bord', () => {
    loginAs('assistant');
    expect(router.serializeUrl(run(['admin']) as UrlTree)).toBe('/admin/tableau-de-bord');
  });

  it('renvoie un patient vers l’accueil', () => {
    loginAs('patient');
    expect(router.serializeUrl(run(['admin']) as UrlTree)).toBe('/');
  });

  it('réserve par défaut les routes au personnel', () => {
    loginAs('assistant');
    expect(run()).toBeTrue();
    loginAs('patient');
    expect(router.serializeUrl(run() as UrlTree)).toBe('/');
  });
});
