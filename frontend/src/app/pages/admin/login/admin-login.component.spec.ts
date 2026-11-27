import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AdminLoginComponent } from './admin-login.component';
import { fakeJwt } from '../../../testing/jwt';

describe('AdminLoginComponent', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;
  let component: AdminLoginComponent;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  const fill = () => component.loginForm.setValue({ email: 'admin@meditrack.ma', motDePasse: 'Secret123' });

  it("n'appelle pas l'API si le formulaire est vide", () => {
    component.onSubmit();
    http.expectNone('/api/auth/login');
    expect(component.loginForm.touched).toBeTrue();
  });

  it('passe à l’étape du code quand la 2FA est demandée, puis redirige le personnel', () => {
    fill();
    component.onSubmit();
    http.expectOne('/api/auth/login').flush({ twoFactorRequired: true, challengeId: 'c1', message: 'Code envoyé' });
    expect(component.challengeId).toBe('c1');

    component.codeForm.setValue({ code: '123456' });
    component.onSubmitCode();
    http.expectOne('/api/auth/2fa/verify').flush({ token: fakeJwt('admin'), tokenType: 'Bearer', email: 'admin@meditrack.ma', role: 'admin' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/tableau-de-bord');
  });

  it('renvoie un patient vers le site public', () => {
    fill();
    component.onSubmit();
    http.expectOne('/api/auth/login').flush({ token: fakeJwt('patient'), tokenType: 'Bearer', email: 'p@b.ma', role: 'patient' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('refuse un code qui n’a pas 6 chiffres', () => {
    component.challengeId = 'c1';
    component.codeForm.setValue({ code: '12' });
    component.onSubmitCode();
    http.expectNone('/api/auth/2fa/verify');
  });

  it('revient à l’étape mot de passe si le compte est bloqué', () => {
    component.challengeId = 'c1';
    component.codeForm.setValue({ code: '000000' });
    component.onSubmitCode();
    http.expectOne('/api/auth/2fa/verify').flush({ message: 'Compte temporairement bloqué' }, { status: 423, statusText: 'Locked' });
    expect(component.challengeId).toBeNull();
    expect(component.errorMessage).toContain('bloqué');
  });

  it('affiche un message clair selon l’erreur', () => {
    fill();
    component.onSubmit();
    http.expectOne('/api/auth/login').flush(null, { status: 429, statusText: 'Too Many Requests' });
    expect(component.errorMessage).toContain('Trop de tentatives');

    component.onSubmit();
    http.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(component.errorMessage).toContain('Identifiants incorrects');
  });

  it('restart remet le formulaire à zéro', () => {
    component.challengeId = 'c1';
    component.errorMessage = 'x';
    component.restart();
    expect(component.challengeId).toBeNull();
    expect(component.errorMessage).toBe('');
  });

  it('bascule l’affichage du mot de passe', () => {
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
  });
});
