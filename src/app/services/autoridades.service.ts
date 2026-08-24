/**
 * @file autoridades.service.ts
 * @description Servicio de autoridades conectado al backend NestJS.
 * Reemplaza la versión basada en localStorage.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Autoridad, CreateAutoridadDto } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AutoridadesService {
  private readonly apiUrl = `${environment.apiUrl}/autoridades`;

  private subject = new BehaviorSubject<Autoridad[]>([]);
  autoridades$ = this.subject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarTodas();
  }

  cargarTodas(): void {
    this.http.get<Autoridad[]>(this.apiUrl).subscribe({
      next:  lista => this.subject.next(lista),
      error: err   => console.error('[AutoridadesService] Error al cargar:', err),
    });
  }

  getAll(): Autoridad[] { return this.subject.value; }

  getById(id: string): Observable<Autoridad> {
    return this.http.get<Autoridad>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreateAutoridadDto): Observable<Autoridad> {
    return this.http.post<Autoridad>(this.apiUrl, dto).pipe(
      tap(() => this.cargarTodas())
    );
  }

  actualizar(id: string, dto: Partial<CreateAutoridadDto>): Observable<Autoridad> {
    return this.http.put<Autoridad>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(() => this.cargarTodas())
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarTodas())
    );
  }
}
