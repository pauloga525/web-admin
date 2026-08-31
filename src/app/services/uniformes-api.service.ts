/**
 * @file uniformes-api.service.ts
 * @description CRUD real contra /uniformes (colección dedicada — el catálogo tiene
 * campos propios como precio/disponibilidad que no encajan en /recursos).
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UniformeImagenApi {
  url: string;
  alt: string;
}

export interface UniformeApi {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  availability: string;
  images: UniformeImagenApi[];
  publicado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface UniformeDto {
  name: string;
  category?: string;
  description?: string;
  price?: string;
  availability?: string;
  images?: UniformeImagenApi[];
  publicado?: boolean;
  orden?: number;
}

@Injectable({ providedIn: 'root' })
export class UniformesApiService {
  private readonly url = `${environment.apiUrl}/uniformes`;

  constructor(private http: HttpClient) {}

  list(): Observable<UniformeApi[]> {
    return this.http.get<UniformeApi[]>(this.url);
  }

  create(dto: UniformeDto): Observable<UniformeApi> {
    return this.http.post<UniformeApi>(this.url, dto);
  }

  update(id: string, dto: Partial<UniformeDto>): Observable<UniformeApi> {
    return this.http.put<UniformeApi>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
