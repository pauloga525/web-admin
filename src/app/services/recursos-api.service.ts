/**
 * @file recursos-api.service.ts
 * @description CRUD real contra /recursos — usado por Biblioteca e Instructivos.
 * Cada documento se distingue por `tipo`: 'libro' (Biblioteca) o 'pdf'/'video' (Instructivos).
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RecursoApi {
  _id: string;
  titulo: string;
  descripcion: string;
  url: string;
  imagen: string;
  tipo: string;
  categoria: string;
  tags: string[];
  publicado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecursoDto {
  titulo: string;
  descripcion?: string;
  tipo?: string;
  url?: string;
  imagen?: string;
  categoria?: string;
  tags?: string[];
  publicado?: boolean;
  orden?: number;
}

@Injectable({ providedIn: 'root' })
export class RecursosApiService {
  private readonly url = `${environment.apiUrl}/recursos`;

  constructor(private http: HttpClient) {}

  list(): Observable<RecursoApi[]> {
    return this.http.get<RecursoApi[]>(this.url);
  }

  /** Lista solo los recursos de los tipos indicados, ordenados por `orden`. */
  listByTipo(...tipos: string[]): Observable<RecursoApi[]> {
    return this.list().pipe(
      map(list => list.filter(r => tipos.includes(r.tipo)).sort((a, b) => a.orden - b.orden))
    );
  }

  create(dto: RecursoDto): Observable<RecursoApi> {
    return this.http.post<RecursoApi>(this.url, dto);
  }

  update(id: string, dto: RecursoDto): Observable<RecursoApi> {
    return this.http.put<RecursoApi>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
