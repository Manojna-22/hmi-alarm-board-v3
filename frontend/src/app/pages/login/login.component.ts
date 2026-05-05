import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
          <h1 class="auth-title">HMI Alarm Board</h1>
          <p class="auth-sub">Sign in to your account</p>
        </div>

        <div class="session-warn" *ngIf="sessionExpired">
          ⚠ Your session expired. Please sign in again.
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" autocomplete="on">

          <div class="field">
            <label>Username</label>
            <input class="inp" type="text" [(ngModel)]="username" name="username"
                   placeholder="Enter username" autocomplete="username"
                   [disabled]="loading" required/>
          </div>

          <div class="field">
            <label>Password</label>
            <div class="pw-wrap">
              <input class="inp" [type]="showPw ? 'text' : 'password'"
                     [(ngModel)]="password" name="password"
                     placeholder="Enter password" autocomplete="current-password"
                     [disabled]="loading" required/>
              <button type="button" class="eye-btn" (click)="showPw = !showPw">
                {{ showPw ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="field-error" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="submit-btn"
                  [disabled]="loading || !username.trim() || !password.trim()">
            <span class="spin" *ngIf="loading"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account?
          <a routerLink="/register" class="link">Create account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: var(--bg-primary);
      position: relative; overflow: hidden;
    }
    .auth-bg { position: fixed; inset: 0; pointer-events: none; }
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(100px); opacity: 0.12;
    }
    .o1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, var(--color-accent), transparent 70%);
      top: -150px; left: -150px;
    }
    .o2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, var(--color-critical), transparent 70%);
      bottom: -100px; right: -100px;
    }
    .auth-card {
      position: relative; z-index: 1;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 20px; padding: 2.5rem 2rem;
      width: 420px; max-width: calc(100vw - 2rem);
      box-shadow: 0 30px 80px rgba(0,0,0,0.5);
      animation: cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo {
      width: 60px; height: 60px; border-radius: 16px;
      background: linear-gradient(135deg, var(--color-accent), #0066ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; margin: 0 auto 1rem;
      box-shadow: 0 8px 24px rgba(88,166,255,0.3);
    }
    .auth-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 4px; }
    .auth-sub   { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
    .session-warn {
      background: rgba(245,158,11,0.1); border: 1px solid var(--color-medium);
      border-radius: 8px; padding: 0.6rem 1rem;
      color: var(--color-medium); font-size: 0.82rem;
      margin-bottom: 1.2rem; text-align: center;
    }
    .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
    .pw-wrap { position: relative; display: flex; align-items: center; }
    .inp {
      width: 100%; background: var(--bg-primary);
      border: 1px solid var(--border-color); border-radius: 10px;
      color: var(--text-primary); padding: 0.7rem 0.9rem;
      font-size: 0.9rem; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: var(--font-sans);
    }
    .inp:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(88,166,255,0.1);
    }
    .inp:disabled { opacity: 0.5; }
    .pw-wrap .inp { padding-right: 2.5rem; }
    .eye-btn {
      position: absolute; right: 10px; background: none; border: none;
      cursor: pointer; font-size: 0.9rem; opacity: 0.6; transition: opacity 0.15s;
    }
    .eye-btn:hover { opacity: 1; }
    .field-error {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.35);
      border-radius: 8px; padding: 0.6rem 0.9rem;
      color: var(--color-critical); font-size: 0.83rem;
    }
    .submit-btn {
      background: var(--color-accent); color: #000;
      border: none; border-radius: 10px; padding: 0.8rem;
      font-size: 0.95rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: flex;
      align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.2rem;
    }
    .submit-btn:hover:not(:disabled) {
      background: #79c0ff;
      box-shadow: 0 4px 16px rgba(88,166,255,0.3);
    }
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
export class LoginComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  username = ''; password = ''; showPw = false;
  loading = false; errorMsg = ''; sessionExpired = false;
  private returnUrl = '/dashboard';

  ngOnInit() {
    if (this.auth.isLoggedIn()) { this.router.navigate(['/dashboard']); return; }
    this.route.queryParams.subscribe(p => {
      this.sessionExpired = p['reason'] === 'session_expired';
      this.returnUrl = p['returnUrl'] || '/dashboard';
    });
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) return;
    this.loading = true; this.errorMsg = '';
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => { this.loading = false; this.router.navigate([this.returnUrl]); },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        this.errorMsg = (msg && msg !== 'An unexpected error occurred')
          ? msg : 'Invalid username or password';
      }
    });
  }
}
