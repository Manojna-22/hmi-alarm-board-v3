import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/alarm.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb o1"></div>
        <div class="orb o2"></div>
      </div>

      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">⚡</div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-sub">HMI Alarm Board — New User Registration</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" autocomplete="on">

          <div class="field">
            <label>Username <span class="req">*</span></label>
            <input class="inp" type="text" [(ngModel)]="form.username" name="username"
                   placeholder="Choose a username (min 3 chars)"
                   autocomplete="username" [disabled]="loading" required/>
          </div>

          <div class="field">
            <label>Email <span class="req">*</span></label>
            <input class="inp" type="email" [(ngModel)]="form.email" name="email"
                   placeholder="your@email.com"
                   autocomplete="email" [disabled]="loading" required/>
          </div>

          <div class="field">
            <label>Full Name</label>
            <input class="inp" type="text" [(ngModel)]="form.fullName" name="fullName"
                   placeholder="Your full name (optional)"
                   [disabled]="loading"/>
          </div>

          <div class="field">
            <label>Password <span class="req">*</span></label>
            <div class="pw-wrap">
              <input class="inp" [type]="showPw ? 'text' : 'password'"
                     [(ngModel)]="form.password" name="password"
                     placeholder="Min 6 chars + 1 special character"
                     autocomplete="new-password" [disabled]="loading" required
                     (input)="checkPassword()"/>
              <button type="button" class="eye-btn" (click)="showPw = !showPw">
                {{ showPw ? '🙈' : '👁' }}
              </button>
            </div>
            <!-- Password strength indicator -->
            <div class="pw-rules" *ngIf="form.password">
              <span [class.ok]="form.password.length >= 6" [class.fail]="form.password.length < 6">
                {{ form.password.length >= 6 ? '✓' : '✗' }} At least 6 characters
              </span>
              <span [class.ok]="hasSpecial" [class.fail]="!hasSpecial">
                {{ hasSpecial ? '✓' : '✗' }} At least one special character (!&#64;#$%...)
              </span>
            </div>
          </div>

          <div class="field">
            <label>Role <span class="req">*</span></label>
            <div class="role-grid">
              <button type="button" class="role-btn"
                      [class.role-active]="form.role === 'ROLE_ADMIN'"
                      (click)="form.role = 'ROLE_ADMIN'">
                <span class="role-icon">🔑</span>
                <span class="role-name">Admin</span>
                <span class="role-desc">Full access + delete</span>
              </button>
              <button type="button" class="role-btn"
                      [class.role-active]="form.role === 'ROLE_OPERATOR'"
                      (click)="form.role = 'ROLE_OPERATOR'">
                <span class="role-icon">👷</span>
                <span class="role-name">Operator</span>
                <span class="role-desc">Manage alarms</span>
              </button>
            </div>
          </div>

          <div class="field-error" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="submit-btn"
                  [disabled]="loading || !canSubmit()">
            <span class="spin" *ngIf="loading"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/login" class="link">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: var(--bg-primary);
      position: relative; overflow: hidden; padding: 2rem 0;
    }
    .auth-bg { position: fixed; inset: 0; pointer-events: none; }
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(100px); opacity: 0.1;
    }
    .o1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, var(--color-accent), transparent 70%);
      top: -150px; left: -150px;
    }
    .o2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, var(--color-low), transparent 70%);
      bottom: -100px; right: -100px;
    }
    .auth-card {
      position: relative; z-index: 1;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 20px; padding: 2.5rem 2rem;
      width: 460px; max-width: calc(100vw - 2rem);
      box-shadow: 0 30px 80px rgba(0,0,0,0.5);
      animation: cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }
    .auth-header { text-align: center; margin-bottom: 1.8rem; }
    .auth-logo {
      width: 60px; height: 60px; border-radius: 16px;
      background: linear-gradient(135deg, var(--color-accent), #0066ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; margin: 0 auto 1rem;
    }
    .auth-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 4px; }
    .auth-sub   { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
    .auth-form  { display: flex; flex-direction: column; gap: 1rem; }
    .field      { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
    .req { color: var(--color-critical); }
    .pw-wrap { position: relative; display: flex; align-items: center; }
    .inp {
      width: 100%; background: var(--bg-primary);
      border: 1px solid var(--border-color); border-radius: 10px;
      color: var(--text-primary); padding: 0.65rem 0.9rem;
      font-size: 0.875rem; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: var(--font-sans);
    }
    .inp:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(88,166,255,0.1); }
    .inp:disabled { opacity: 0.5; }
    .pw-wrap .inp { padding-right: 2.5rem; }
    .eye-btn {
      position: absolute; right: 10px; background: none; border: none;
      cursor: pointer; font-size: 0.9rem; opacity: 0.6;
    }
    .eye-btn:hover { opacity: 1; }
    .pw-rules {
      display: flex; flex-direction: column; gap: 2px; margin-top: 4px;
    }
    .pw-rules span { font-size: 0.72rem; }
    .ok   { color: var(--color-low); }
    .fail { color: var(--color-medium); }
    .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .role-btn {
      background: var(--bg-primary); border: 1px solid var(--border-color);
      border-radius: 10px; padding: 0.9rem 0.75rem;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      cursor: pointer; transition: all 0.2s; text-align: center;
    }
    .role-btn:hover { border-color: var(--color-accent); }
    .role-btn.role-active {
      border-color: var(--color-accent);
      background: rgba(88,166,255,0.08);
      box-shadow: 0 0 0 2px rgba(88,166,255,0.2);
    }
    .role-icon { font-size: 1.4rem; }
    .role-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
    .role-desc { font-size: 0.68rem; color: var(--text-muted); }
    .field-error {
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.35);
      border-radius: 8px; padding: 0.6rem 0.9rem;
      color: var(--color-critical); font-size: 0.83rem;
    }
    .submit-btn {
      background: var(--color-accent); color: #000; border: none;
      border-radius: 10px; padding: 0.8rem; font-size: 0.95rem;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.3rem;
    }
    .submit-btn:hover:not(:disabled) { background: #79c0ff; }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .spin {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.3); border-top-color: #000;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer {
      margin-top: 1.5rem; text-align: center;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .link { color: var(--color-accent); font-weight: 600; text-decoration: none; }
    .link:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);

  form: { username: string; email: string; password: string; fullName: string; role: UserRole } = {
    username: '', email: '', password: '', fullName: '', role: 'ROLE_OPERATOR'
  };

  showPw = false; loading = false; errorMsg = ''; hasSpecial = false;

  ngOnInit() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  checkPassword() {
    this.hasSpecial = /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(this.form.password);
  }

  canSubmit(): boolean {
    return !!this.form.username.trim()
        && !!this.form.email.trim()
        && this.form.password.length >= 6
        && this.hasSpecial
        && !!this.form.role;
  }

  onSubmit() {
    if (!this.canSubmit()) return;
    this.loading = true; this.errorMsg = '';
    this.auth.register({
      username: this.form.username.trim(),
      email:    this.form.email.trim(),
      password: this.form.password,
      fullName: this.form.fullName.trim() || undefined,
      role:     this.form.role
    }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.data?.username || err?.error?.data?.email;
        this.errorMsg = msg || 'Registration failed. Please try again.';
      }
    });
  }
}
