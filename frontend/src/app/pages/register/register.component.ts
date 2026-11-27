import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="icon-circle">
            <span class="material-symbols-outlined icon">person_add</span>
          </div>
          <h1 class="login-title">Créer un compte patient</h1>
          <p class="login-subtitle">Suivez vos rendez-vous au cabinet MediTrack</p>
        </div>

        <div class="error-banner" *ngIf="errorMessage" role="alert">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
          <div class="row">
            <div class="form-group" [class.has-error]="invalid('firstName')">
              <label for="firstName" class="form-label">Prénom</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined field-icon">person</span>
                <input id="firstName" formControlName="firstName" class="form-control" autocomplete="given-name">
              </div>
              <div class="error-msg" *ngIf="invalid('firstName')">Le prénom est obligatoire.</div>
            </div>
            <div class="form-group">
              <label for="lastName" class="form-label">Nom <small>(facultatif)</small></label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined field-icon">badge</span>
                <input id="lastName" formControlName="lastName" class="form-control" autocomplete="family-name">
              </div>
            </div>
          </div>

          <div class="form-group" [class.has-error]="invalid('email')">
            <label for="email" class="form-label">Adresse e-mail</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">mail</span>
              <input type="email" id="email" formControlName="email" class="form-control" autocomplete="email">
            </div>
            <div class="error-msg" *ngIf="invalid('email')">Saisissez une adresse e-mail valide.</div>
          </div>

          <div class="form-group" [class.has-error]="invalid('phone')">
            <label for="phone" class="form-label">Téléphone <small>(facultatif)</small></label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">call</span>
              <input type="tel" id="phone" formControlName="phone" class="form-control" placeholder="06 12 34 56 78" autocomplete="tel">
            </div>
            <div class="error-msg" *ngIf="invalid('phone')">Numéro de téléphone invalide.</div>
          </div>

          <div class="form-group" [class.has-error]="invalid('password')">
            <label for="password" class="form-label">Mot de passe</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" class="form-control" autocomplete="new-password">
              <button type="button" class="btn-toggle-pwd" (click)="showPassword = !showPassword" aria-label="Afficher ou masquer le mot de passe">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="error-msg" *ngIf="invalid('password')">8 caractères minimum.</div>
          </div>

          <div class="form-group" [class.has-error]="(form.errors?.['mismatch'] || invalid('confirmPassword')) && (form.get('confirmPassword')?.touched || submitted)">
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input [type]="showPassword ? 'text' : 'password'" id="confirmPassword" formControlName="confirmPassword" class="form-control" autocomplete="new-password">
            </div>
            <div class="error-msg" *ngIf="form.errors?.['mismatch'] && (form.get('confirmPassword')?.touched || submitted)">
              Les mots de passe ne correspondent pas.
            </div>
          </div>

          <button type="submit" class="btn-login" [disabled]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">how_to_reg</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Création du compte...' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <div class="login-footer">
          <p class="register-hint">Déjà inscrit ? <a routerLink="/admin/connexion">Se connecter</a></p>
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
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 480px) { .row { grid-template-columns: 1fr; } }
    .form-label small { font-weight: 400; color: #94a3b8; }
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
export class RegisterComponent {
  form: FormGroup;
  submitted = false;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.maxLength(60)]],
        lastName: ['', [Validators.maxLength(60)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(/^[+0-9 .-]{8,20}$/)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordsMatch }
    );
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, phone, password } = this.form.value;
    this.isLoading = true;
    this.authService
      .register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone?.trim() || undefined, password })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 0) this.errorMessage = 'Impossible de contacter le serveur.';
          else if (err.status === 409) this.errorMessage = 'Un compte existe déjà avec cette adresse e-mail.';
          else if (err.status === 429) this.errorMessage = 'Trop de tentatives. Réessayez dans quelques minutes.';
          else this.errorMessage = err.error?.message || 'Inscription impossible. Veuillez réessayer.';
        }
      });
  }
}
