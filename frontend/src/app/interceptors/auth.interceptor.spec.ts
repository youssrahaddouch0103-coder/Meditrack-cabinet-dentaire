import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    ctrl.verify();
    localStorage.clear();
  });

  it('ajoute le jeton aux appels /api', () => {
    localStorage.setItem('cabinet_admin_jwt_token', 'abc');
    http.get('/api/users').subscribe();
    expect(ctrl.expectOne('/api/users').request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it("n'envoie pas le jeton à un autre domaine", () => {
    localStorage.setItem('cabinet_admin_jwt_token', 'abc');
    http.get('https://cdn.example.com/x.json').subscribe();
    expect(ctrl.expectOne('https://cdn.example.com/x.json').request.headers.has('Authorization')).toBeFalse();
  });

  it('ne met pas d’en-tête sans jeton', () => {
    http.get('/api/health').subscribe();
    expect(ctrl.expectOne('/api/health').request.headers.has('Authorization')).toBeFalse();
  });
});
