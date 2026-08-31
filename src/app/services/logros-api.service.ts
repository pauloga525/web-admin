/**
 * @file logros-api.service.ts
 * @description CRUD real contra /logros (fuente autoritativa de "Logros Estudiantiles",
 * consumida por la página pública de Logros y por el teaser en Alumnos).
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LogroApi {
  _id: string;
  badge: string;
  badgeClass: string;
  date: string;
  title: string;
  category: string;
  description: string;
  image: string;
  featured: boolean;
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogroDto {
  badge?: string;
  badgeClass?: string;
  date?: string;
  title: string;
  category?: string;
  description?: string;
  image?: string;
  featured?: boolean;
  publicado?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LogrosApiService {
  private readonly url = `${environment.apiUrl}/logros`;

  constructor(private http: HttpClient) {}

  list(): Observable<LogroApi[]> {
    return this.http.get<LogroApi[]>(this.url);
  }

  create(dto: LogroDto): Observable<LogroApi> {
    return this.http.post<LogroApi>(this.url, dto);
  }

  update(id: string, dto: Partial<LogroDto>): Observable<LogroApi> {
    return this.http.put<LogroApi>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
