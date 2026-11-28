import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { JwtAuthResponse, isTwoFactorChallenge } from '../../../models/auth.model';
import { STAFF_ROLES } from '../../../config/access.config';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        
        <div class="login-header">
          <div class="icon-circle">
            <span class="material-symbols-outlined icon">{{ challengeId ? 'pin' : 'admin_panel_settings' }}</span>
          </div>
          <h1 class="login-title">{{ challengeId ? 'Vérification en deux étapes' : 'Connexion MediTrack' }}</h1>
          <p class="login-subtitle">Connectez-vous pour gérer le cabinet dentaire</p>
        </div>

        <!-- Error message banner -->
        <div class="error-banner" *ngIf="errorMessage" role="alert">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form *ngIf="!challengeId" [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate autocomplete="off">
          
          <!-- Email field -->
          <div class="form-group" [class.has-error]="f['email'].invalid && (f['email'].touched || isSubmitted)">
            <label for="email" class="form-label">Adresse e-mail</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">mail</span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="votre.email@exemple.fr"
                autocomplete="off">
            </div>
            <div class="error-msg" *ngIf="f['email'].invalid && (f['email'].touched || isSubmitted)">
              <span *ngIf="f['email'].errors?.['required']">Veuillez saisir votre adresse e-mail.</span>
              <span *ngIf="f['email'].errors?.['email']">Format d’adresse e-mail invalide.</span>
            </div>
          </div>

          <!-- Password field -->
          <div class="form-group" [class.has-error]="f['motDePasse'].invalid && (f['motDePasse'].touched || isSubmitted)">
            <div class="label-row">
              <label for="motDePasse" class="form-label">Mot de passe</label>
              <a routerLink="/admin/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
            </div>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="motDePasse" 
                formControlName="motDePasse" 
                class="form-control" 
                placeholder="••••••••"
                autocomplete="new-password">
              <button type="button" class="btn-toggle-pwd" (click)="togglePasswordVisibility()" aria-label="Afficher ou masquer le mot de passe">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="error-msg" *ngIf="f['motDePasse'].invalid && (f['motDePasse'].touched || isSubmitted)">
              <span *ngIf="f['motDePasse'].errors?.['required']">Veuillez saisir votre mot de passe.</span>
            </div>
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="btn-login" 
            [disabled]="isLoading"
            [class.loading]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">login</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}</span>
          </button>

        </form>


        <!-- Étape 2 : code reçu par email -->
        <form *ngIf="challengeId" [formGroup]="codeForm" (ngSubmit)="onSubmitCode()" class="login-form" novalidate autocomplete="off">
          <div class="form-group" [class.has-error]="codeForm.controls['code'].invalid && (codeForm.controls['code'].touched || isCodeSubmitted)">
            <label for="code" class="form-label">Code à 6 chiffres</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">pin</span>
              <input
                type="text"
                id="code"
                formControlName="code"
                class="form-control code-input"
                inputmode="numeric"
                maxlength="6"
                placeholder="123456"
                autocomplete="one-time-code">
            </div>
            <div class="error-msg" *ngIf="codeForm.controls['code'].invalid && (codeForm.controls['code'].touched || isCodeSubmitted)">
              <span>Saisissez les 6 chiffres reçus par email.</span>
            </div>
          </div>

          <button type="submit" class="btn-login" [disabled]="isLoading" [class.loading]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">verified_user</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Vérification...' : 'Valider le code' }}</span>
          </button>

          <button type="button" class="btn-link" (click)="restart()">Renvoyer un code / changer de compte</button>
        </form>

        <div class="login-footer">
          <p class="register-hint" *ngIf="!challengeId">
            Pas encore de compte ? <a routerLink="/inscription">Créer un compte patient</a>
          </p>
          <a routerLink="/" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour au site public</span>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 20px;
      padding: 40px 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      background: #e0f2fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .icon {
      font-size: 36px;
      color: #0284c7;
    }

    .login-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .login-subtitle {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #991b1b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .forgot-link {
      font-size: 0.825rem;
      color: #0284c7;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #0369a1;
        text-decoration: underline;
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      font-size: 20px;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f172a;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    .has-error .form-control {
      border-color: #ef4444;
    }

    .btn-toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #475569;
      }
    }

    .error-msg {
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 4px;
    }

    .btn-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 8px;

      &:hover:not(:disabled) {
        background: #0369a1;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .code-input {
      letter-spacing: 0.5em;
      font-size: 1.25rem;
      text-align: center;
    }
    .btn-link {
      background: none;
      border: none;
      color: #0284c7;
      font-size: 0.85rem;
      cursor: pointer;
      text-decoration: underline;
      align-self: center;
    }
    .register-hint {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 12px;
      text-align: center;
      a { color: #0284c7; font-weight: 600; }
    }
    .login-footer {
      margin-top: 28px;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;

      &:hover {
        color: #0284c7;
      }
    }
  `]
})
export class AdminLoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  codeForm!: FormGroup;
  isSubmitted = false;
  isCodeSubmitted = false;
  challengeId: string | null = null;
  challengeMessage = '';
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  returnUrl: string = '/admin/tableau-de-bord';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/tableau-de-bord']);
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/tableau-de-bord';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngAfterViewInit(): void {
    // Forcer l'effacement de toute re-injection automatique par le navigateur
    setTimeout(() => {
      if (this.loginForm) {
        this.loginForm.reset({ email: '', motDePasse: '' });
      }
    }, 150);
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (isTwoFactorChallenge(response)) {
          this.challengeId = response.challengeId;
          this.challengeMessage = response.message;
          return;
        }
        this.redirectAfterLogin(response);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.describeError(err);
      }
    });
  }

  onSubmitCode(): void {
    this.isCodeSubmitted = true;
    this.errorMessage = '';
    if (this.codeForm.invalid || !this.challengeId) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.verifyTwoFactor(this.challengeId, this.codeForm.value.code.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.redirectAfterLogin(response);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.describeError(err);
        // Code expiré ou compte bloqué : il faut recommencer depuis le mot de passe
        if (err.status === 423 || /expiré/i.test(err.error?.message || '')) {
          this.challengeId = null;
        }
        this.codeForm.reset();
      }
    });
  }

  restart(): void {
    this.challengeId = null;
    this.errorMessage = '';
    this.codeForm.reset();
    this.isCodeSubmitted = false;
  }

  private redirectAfterLogin(response: JwtAuthResponse): void {
    const isStaff = STAFF_ROLES.includes(response.role);
    this.router.navigateByUrl(isStaff ? this.returnUrl : '/');
  }

  private describeError(err: any): string {
    if (err.status === 0) return 'Impossible de contacter le serveur. Vérifiez que l’API est lancée.';
    if (err.status === 429) return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
    if (err.status === 401 && !err.error?.message) {
      return 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.';
    }
    return err.error?.message || 'Erreur lors de la connexion. Veuillez réessayer.';
  }
}
