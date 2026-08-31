/**
 * @file users-api.service.ts
 * @description Gestión real de usuarios contra el backend (GET/POST/PUT/DELETE /users).
 * Reemplaza al antiguo UsersService (que solo persistía en localStorage).
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser, UserRole } from '../models/api.models';

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  cargo?: string;
  rol: UserRole;
  status: 'active' | 'inactive';
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  username?: string;
  email?: string;
  password?: string;
  cargo?: string;
  rol?: UserRole;
  status?: 'active' | 'inactive';
  avatar?: string;
}

export const ROLES: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin',       label: 'Admin'       },
  { value: 'editor',      label: 'Editor'      },
  { value: 'viewer',      label: 'Viewer'      },
];

const COLORS = ['bg-primary', 'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500', 'bg-violet-500'];

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  create(dto: CreateUserDto): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ─── Helpers de UI (decorativos, no vienen del backend) ────────────────────

  getIniciales(u: AppUser): string {
    const a = (u.nombre?.[0]   ?? '').toUpperCase();
    const b = (u.apellido?.[0] ?? '').toUpperCase();
    return b ? a + b : a || '?';
  }

  getRolLabel(rol: UserRole): string {
    return ROLES.find(r => r.value === rol)?.label ?? rol;
  }

  /** Color determinístico por usuario, solo para el avatar — no persiste en backend. */
  colorFor(u: AppUser): string {
    let hash = 0;
    for (const ch of u._id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return COLORS[hash % COLORS.length];
  }
}
