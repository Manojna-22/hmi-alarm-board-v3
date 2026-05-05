import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserRole
} from '../models/alarm.model';

const TOKEN_KEY = 'hmi_jwt';
const USER_KEY  = 'hmi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private base   = `${environment.apiBaseUrl}/auth`;

  // ---- reactive state ----
  private _user = signal<AuthResponse | null>(this._loadUser());

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly isAdmin     = computed(() => this._user()?.role === 'ROLE_ADMIN');
  readonly username    = computed(() => this._user()?.username ?? '');
  readonly fullName    = computed(() => this._user()?.fullName ?? '');
  readonly email       = computed(() => this._user()?.email ?? '');
  readonly role        = computed(() => this._user()?.role ?? null);

  // ---- auth operations ----

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/login`, req)
      .pipe(map(r => r.data), tap(a => this._save(a)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/register`, req)
      .pipe(map(r => r.data), tap(a => this._save(a)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ---- private ----

  private _save(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth));
    this._user.set(auth);
  }

  private _loadUser(): AuthResponse | null {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }
}
