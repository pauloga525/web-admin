/**
 * @file consejo-api.service.ts
 * @description CRUD real contra /consejo — miembros del Consejo Estudiantil.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MiembroConsejoApi {
  _id: string;
  titulo: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  publicado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface MiembroConsejoDto {
  titulo?: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  publicado?: boolean;
  orden?: number;
}

@Injectable({ providedIn: 'root' })
export class ConsejoApiService {
  private readonly url = `${environment.apiUrl}/consejo`;

  constructor(private http: HttpClient) {}

  list(): Observable<MiembroConsejoApi[]> {
    return this.http.get<MiembroConsejoApi[]>(this.url);
  }

  create(dto: MiembroConsejoDto): Observable<MiembroConsejoApi> {
    return this.http.post<MiembroConsejoApi>(this.url, dto);
  }

  update(id: string, dto: Partial<MiembroConsejoDto>): Observable<MiembroConsejoApi> {
    return this.http.put<MiembroConsejoApi>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
