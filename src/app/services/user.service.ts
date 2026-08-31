import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserProfile {
  nombre:   string;
  apellido: string;
  username: string;
  email:    string;
  cargo:    string;
  avatar:   string;
  password: string; // Nunca se popula desde el backend
}

const DEFAULT: UserProfile = {
  nombre:   '',
  apellido: '',
  username: '',
  email:    '',
  cargo:    '',
  avatar:   '',
  password: '',
};

@Injectable({ providedIn: 'root' })
export class UserService {

  private subject = new BehaviorSubject<UserProfile>({ ...DEFAULT });
  profile$ = this.subject.asObservable();

  constructor(private auth: AuthService, private http: HttpClient) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.subject.next({
          nombre:   user.nombre   ?? '',
          apellido: user.apellido ?? '',
          username: user.username ?? '',
          email:    user.email    ?? '',
          cargo:    user.cargo    ?? '',
          avatar:   user.avatar   ?? '',
          password: '',
        });
      } else {
        this.subject.next({ ...DEFAULT });
      }
    });
  }

  get(): UserProfile { return this.subject.value; }

  /** Guarda el perfil en el backend y actualiza el estado local. */
  guardar(p: UserProfile): void {
    this.subject.next({ ...p, password: '' });
    const user = this.auth.getCurrentUser();
    if (!user?._id) return;
    this.http.put(`${environment.apiUrl}/users/${user._id}`, {
      nombre:   p.nombre,
      apellido: p.apellido,
      cargo:    p.cargo,
      avatar:   p.avatar,
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => this.auth.refreshProfile().pipe(catchError(() => of(null))).subscribe());
  }

  getCopia(): UserProfile { return { ...this.subject.value }; }

  /** Cambia la contraseña del usuario autenticado, verificando la actual en el backend. */
  cambiarPassword(actual: string, nueva: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/users/me/password`, {
      current_password: actual,
      new_password: nueva,
    });
  }

  getIniciales(): string {
    const p = this.subject.value;
    const a = (p.nombre?.[0]  ?? '').toUpperCase();
    const b = (p.apellido?.[0] ?? '').toUpperCase();
    return b ? a + b : a || 'A';
  }

  getNombreCompleto(): string {
    const p = this.subject.value;
    return [p.nombre, p.apellido].filter(Boolean).join(' ');
  }
}
