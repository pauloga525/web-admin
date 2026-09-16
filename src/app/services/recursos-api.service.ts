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

export interface EnlaceRecurso {
  url: string;
  descripcion: string;
}

/** Una fila de una tabla de Boscómetro importada desde Excel. */
export interface FilaTablaBoscometro {
  valores: string[];
  esEncabezado: boolean;
}

/** Un punto (curso + total) de un gráfico de Boscómetro importado desde Excel. */
export interface PuntoGraficoBoscometro {
  curso: string;
  total: number;
}

export interface RecursoApi {
  _id: string;
  titulo: string;
  descripcion: string;
  url: string;
  imagen: string;
  tipo: string;
  categoria: string;
  tags: string[];
  enlaces: EnlaceRecurso[];
  /** Solo presente en recursos tipo 'boscometro_tabla'. */
  filas?: FilaTablaBoscometro[];
  /** Solo presente en recursos tipo 'boscometro_grafico'. */
  datos?: PuntoGraficoBoscometro[];
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
  enlaces?: EnlaceRecurso[];
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

  /** Sube un .xlsx y lo guarda como recurso tipo 'boscometro_tabla' (el backend lo parsea). */
  importarTablaBoscometro(titulo: string, file: File): Observable<RecursoApi> {
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('file', file);
    return this.http.post<RecursoApi>(`${this.url}/boscometro/tablas`, form);
  }

  /** Sube un .xlsx (2 columnas: curso, total) y lo guarda como 'boscometro_grafico'. */
  importarGraficoBoscometro(titulo: string, subtitulo: string, file: File): Observable<RecursoApi> {
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('subtitulo', subtitulo);
    form.append('file', file);
    return this.http.post<RecursoApi>(`${this.url}/boscometro/graficos`, form);
  }
}
