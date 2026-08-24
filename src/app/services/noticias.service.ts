/**
 * @file noticias.service.ts
 * @description Servicio de noticias conectado al backend NestJS.
 * Reemplaza la versión basada en localStorage.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Noticia, CreateNoticiaDto } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class NoticiasApiService {
  private readonly apiUrl = `${environment.apiUrl}/noticias`;

  private subject = new BehaviorSubject<Noticia[]>([]);
  noticias$ = this.subject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarTodas();
  }

  cargarTodas(): void {
    this.http.get<Noticia[]>(this.apiUrl).subscribe({
      next:  lista => this.subject.next(lista),
      error: err   => console.error('[NoticiasService] Error al cargar:', err),
    });
  }

  getAll(): Noticia[] { return this.subject.value; }

  getById(id: string): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreateNoticiaDto): Observable<Noticia> {
    return this.http.post<Noticia>(this.apiUrl, dto).pipe(
      tap(() => this.cargarTodas())
    );
  }

  actualizar(id: string, dto: Partial<CreateNoticiaDto>): Observable<Noticia> {
    return this.http.put<Noticia>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(() => this.cargarTodas())
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarTodas())
    );
  }
}

// Alias para compatibilidad con código existente que importa NoticiasService
export { NoticiasApiService as NoticiasService };

// Re-exportar tipos para compatibilidad
export type { Noticia, CreateNoticiaDto };
export interface NoticiaImagen { id: number; url: string; alt: string; }
