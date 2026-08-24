/**
 * @file auth.service.ts
 * @description Autenticación contra el backend NestJS con JWT.
 * Reemplaza la lógica anterior basada en localStorage/sessionStorage.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser, LoginResponse } from '../models/api.models';

const TOKEN_KEY = 'uets_token';
const USER_KEY  = 'uets_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<AppUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ─── Autenticación ────────────────────────────────────────────────────────

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.userSubject.next(res.user as AppUser);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  /** Refresca el perfil desde el backend (útil al recargar la app). */
  refreshProfile(): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      }),
    );
  }

  // ─── Estado ───────────────────────────────────────────────────────────────

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): AppUser | null {
    return this.userSubject.value;
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    return !!user && roles.includes(user.rol);
  }

  // ─── Privado ──────────────────────────────────────────────────────────────

  private loadUser(): AppUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
