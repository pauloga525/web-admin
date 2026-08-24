/**
 * @file especialidad.service.ts
 * @description Servicio de especialidades conectado al backend NestJS.
 * Mantiene la misma API pública que la versión localStorage para
 * minimizar cambios en los componentes existentes.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Especialidad, CreateEspecialidadDto } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly apiUrl = `${environment.apiUrl}/especialidades`;

  private subject = new BehaviorSubject<Especialidad[]>([]);

  /** Observable reactivo — los componentes se suscriben igual que antes. */
  especialidades$ = this.subject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarTodas();
  }

  // ─── Carga ────────────────────────────────────────────────────────────────

  cargarTodas(): void {
    this.http.get<Especialidad[]>(this.apiUrl).subscribe({
      next:  lista => this.subject.next(lista),
      error: err   => console.error('[EspecialidadService] Error al cargar:', err),
    });
  }

  // ─── Consultas ────────────────────────────────────────────────────────────

  /** Snapshot sincrónico (para código que no usa async). */
  getAll(): Especialidad[] {
    return this.subject.value;
  }

  /** Busca por _id. Retorna copia para evitar mutaciones. */
  getById(id: string): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.apiUrl}/${id}`);
  }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  agregar(datos: CreateEspecialidadDto): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, datos);
  }

  actualizar(especialidad: Especialidad): Observable<Especialidad> {
    const { _id, createdAt, updatedAt, ...body } = especialidad;
    return this.http.put<Especialidad>(`${this.apiUrl}/${_id}`, body);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
