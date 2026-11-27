import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { fakeJwt } from '../../testing/jwt';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let http: HttpTestingController;
  let router: Router;

  const valid = {
    firstName: ' Sara ',
    lastName: '',
    email: 'sara@example.com',
    phone: '',
    password: 'Password123',
    confirmPassword: 'Password123'
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('signale les mots de passe différents', () => {
    component.form.setValue({ ...valid, confirmPassword: 'Autre1234' });
    component.onSubmit();
    expect(component.form.errors?.['mismatch']).toBeTrue();
    http.expectNone('/api/auth/register');
  });

  it('refuse un mot de passe trop court', () => {
    component.form.setValue({ ...valid, password: 'abc', confirmPassword: 'abc' });
    component.onSubmit();
    expect(component.invalid('password')).toBeTrue();
  });

  it('crée le compte sans nom de famille et redirige vers l’accueil', () => {
    component.form.setValue(valid);
    component.onSubmit();
    const req = http.expectOne('/api/auth/register');
    expect(req.request.body).toEqual({ firstName: 'Sara', lastName: '', email: 'sara@example.com', phone: undefined, password: 'Password123' });
    req.flush({ token: fakeJwt('patient'), tokenType: 'Bearer', email: 'sara@example.com', role: 'patient' }, { status: 201, statusText: 'Created' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('indique qu’un compte existe déjà (409)', () => {
    component.form.setValue(valid);
    component.onSubmit();
    http.expectOne('/api/auth/register').flush({ message: 'Email déjà utilisé' }, { status: 409, statusText: 'Conflict' });
    expect(component.errorMessage).toContain('existe déjà');
  });

  it('affiche le message de l’API pour les autres erreurs', () => {
    component.form.setValue(valid);
    component.onSubmit();
    http.expectOne('/api/auth/register').flush({ message: 'Données invalides' }, { status: 400, statusText: 'Bad Request' });
    expect(component.errorMessage).toBe('Données invalides');
  });
});
