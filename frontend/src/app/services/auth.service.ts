import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  JwtAuthResponse, LoginRequest, LoginResponse, RegisterRequest, Role, AppUser,
  GenericResponse, AdminAccountInfoResponse, EmergencyCodesResponse, isTwoFactorChallenge
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = `${environment.apiUrl}/auth`;
  private securityUrl = `${environment.apiUrl}/admin/security`;
  private TOKEN_KEY = 'cabinet_admin_jwt_token';
  private EMAIL_KEY = 'cabinet_admin_email';
  private USER_KEY = 'meditrack_user';

  constructor(private http: HttpClient) {}

  /** Étape 1 : email + mot de passe. Renvoie soit le jeton, soit un défi 2FA à valider. */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && !isTwoFactorChallenge(response)) {
          this.storeSession(response);
        }
      })
    );
  }

  /** Étape 2 : code à 6 chiffres reçu par email. */
  verifyTwoFactor(challengeId: string, code: string): Observable<JwtAuthResponse> {
    return this.http
      .post<JwtAuthResponse>(`${this.authUrl}/2fa/verify`, { challengeId, code })
      .pipe(tap(response => this.storeSession(response)));
  }

  register(data: RegisterRequest): Observable<JwtAuthResponse> {
    return this.http
      .post<JwtAuthResponse>(`${this.authUrl}/register`, data)
      .pipe(tap(response => this.storeSession(response)));
  }

  private storeSession(response: JwtAuthResponse): void {
    if (!response?.token) return;
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.EMAIL_KEY, response.email);
    if (response.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getUser(): AppUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  }

  /** Rôle lu dans le jeton (signé par l'API), pas dans le localStorage modifiable. */
  getRole(): Role | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return (payload.role as Role) ?? null;
    } catch {
      return null;
    }
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.getRole();
    return !!role && roles.includes(role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        return Math.floor(Date.now() / 1000) >= payload.exp;
      }
      return false;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  // Public security & recovery methods
  requestPasswordReset(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/reset-password`, { token, newPassword });
  }

  recoverWithEmergencyCode(recoveryCode: string, newLoginEmail: string, newPassword: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/recover-emergency`, {
      recoveryCode,
      newLoginEmail,
      newPassword
    });
  }

  // Protected Admin Security Settings methods
  getAdminAccountInfo(): Observable<AdminAccountInfoResponse> {
    return this.http.get<AdminAccountInfoResponse>(`${this.securityUrl}/account-info`);
  }

  updateLoginEmail(newLoginEmail: string, currentPassword: string): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.securityUrl}/update-login-email`, { newLoginEmail, currentPassword }).pipe(
      tap(() => {
        localStorage.setItem(this.EMAIL_KEY, newLoginEmail);
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.securityUrl}/update-password`, { currentPassword, newPassword });
  }

  generateEmergencyCodes(): Observable<EmergencyCodesResponse> {
    return this.http.post<EmergencyCodesResponse>(`${this.securityUrl}/generate-emergency-codes`, {});
  }
}
