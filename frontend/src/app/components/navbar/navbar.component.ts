import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">HMI Alarm Board</span>
        <span class="brand-badge">LIVE</span>
      </div>

      <div class="navbar-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">📊</span> Dashboard
        </a>
      </div>

      <div class="navbar-right">
        <!-- Role badge -->
        <span class="role-badge" [class.admin]="auth.isAdmin()" [class.operator]="!auth.isAdmin()">
          {{ auth.isAdmin() ? '🔑 ADMIN' : '👷 OPERATOR' }}
        </span>

        <!-- User dropdown -->
        <div class="user-btn" (click)="open = !open" (keydown.enter)="open = !open"
             tabindex="0" (blur)="closeDelay()">
          <div class="avatar">{{ initials() }}</div>
          <div class="uinfo">
            <span class="uname">{{ auth.fullName() || auth.username() }}</span>
            <span class="uuser">{{ auth.username() }}</span>
          </div>
          <span class="chevron" [class.up]="open">▾</span>

          <div class="dropdown" *ngIf="open" (click)="$event.stopPropagation()">
            <div class="dd-top">
              <span class="dd-name">{{ auth.fullName() || auth.username() }}</span>
              <span class="dd-email">{{ auth.email() }}</span>
              <span class="dd-role">{{ auth.role() }}</span>
            </div>
            <div class="dd-sep"></div>
            <button class="dd-item dd-logout" (click)="signOut()">
              🚪 Sign Out
            </button>
          </div>
        </div>

        <div class="status-pill">
          <span class="status-dot"></span>
          <span>Online</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 64px; background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center;
      padding: 0 2rem; gap: 1.5rem;
      position: sticky; top: 0; z-index: 100;
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 0.6rem;
      font-weight: 700; font-size: 1.1rem; color: var(--text-primary);
      flex-shrink: 0;
    }
    .brand-icon { font-size: 1.4rem; }
    .brand-badge {
      background: var(--color-critical); color: white;
      font-size: 0.65rem; font-weight: 700; padding: 2px 6px;
      border-radius: 4px; letter-spacing: 0.1em;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    .navbar-links { display: flex; gap: 0.5rem; flex: 1; }
    .nav-link {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem; border-radius: 8px;
      color: var(--text-secondary); text-decoration: none;
      font-weight: 500; font-size: 0.9rem; transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      background: var(--bg-hover); color: var(--color-accent);
    }
    .navbar-right {
      display: flex; align-items: center; gap: 0.9rem; margin-left: auto;
    }
    .role-badge {
      font-size: 0.68rem; font-weight: 700; padding: 3px 10px;
      border-radius: 6px; letter-spacing: 0.05em; white-space: nowrap;
    }
    .role-badge.admin    { background: rgba(239,68,68,0.12); color: var(--color-critical); border: 1px solid rgba(239,68,68,0.3); }
    .role-badge.operator { background: rgba(245,158,11,0.12); color: var(--color-medium);   border: 1px solid rgba(245,158,11,0.3); }
    .user-btn {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 5px 10px; border-radius: 10px;
      border: 1px solid var(--border-color);
      cursor: pointer; transition: all 0.2s;
      position: relative; outline: none;
    }
    .user-btn:hover { background: var(--bg-hover); border-color: var(--color-accent); }
    .avatar {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-accent), #0066ff);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #fff;
    }
    .uinfo { display: flex; flex-direction: column; gap: 1px; }
    .uname { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; }
    .uuser { font-size: 0.66rem; color: var(--text-muted); }
    .chevron { font-size: 0.72rem; color: var(--text-muted); transition: transform 0.2s; }
    .chevron.up { transform: rotate(180deg); }
    .dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 12px; min-width: 210px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
      overflow: hidden; z-index: 200;
      animation: ddIn 0.15s ease;
    }
    @keyframes ddIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
    .dd-top { padding: 12px 14px; }
    .dd-name  { display:block; font-size:0.85rem; font-weight:600; color:var(--text-primary); }
    .dd-email { display:block; font-size:0.7rem; color:var(--text-muted); margin-top:2px; }
    .dd-role  { display:block; font-size:0.68rem; color:var(--text-secondary); margin-top:2px; }
    .dd-sep   { height:1px; background:var(--border-color); }
    .dd-item  {
      width:100%; background:none; border:none;
      padding:10px 14px; text-align:left; font-size:0.85rem;
      color:var(--text-secondary); cursor:pointer; transition:background 0.15s;
      display:block; font-family:var(--font-sans);
    }
    .dd-item:hover { background:var(--bg-hover); color:var(--text-primary); }
    .dd-logout:hover { color:var(--color-critical); }
    .status-pill {
      display:flex; align-items:center; gap:0.4rem;
      font-size:0.78rem; color:var(--text-secondary);
    }
    .status-dot {
      width:7px; height:7px; border-radius:50%;
      background:var(--color-low); animation:pulse 2s infinite;
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  open = false;
  private _closeTimer: any;

  initials(): string {
    const n = this.auth.fullName() || this.auth.username();
    return n ? n.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2) : '??';
  }

  closeDelay() {
    this._closeTimer = setTimeout(() => { this.open = false; }, 150);
  }

  signOut() {
    this.open = false;
    this.auth.logout();
  }
}
