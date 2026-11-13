/**
 * @file informes.service.ts
 * @description Informe del registro de actividad del panel (solo administradores).
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegistroInforme {
  _id: string;
  tipo: string;
  titulo?: string;
  descripcion: string;
  usuario?: string;
  usuarioId?: string;
  entidad?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InformesService {
  private readonly url = `${environment.apiUrl}/actividad/informe`;

  constructor(private http: HttpClient) {}

  /** `desde` y `hasta` son días locales (YYYY-MM-DD); se envían como instantes UTC. */
  private params(desde: string, hasta: string, usuarioId?: string): HttpParams {
    let p = new HttpParams()
      .set('desde', new Date(`${desde}T00:00:00`).toISOString())
      .set('hasta', new Date(`${hasta}T23:59:59.999`).toISOString())
      .set('tz', String(new Date().getTimezoneOffset()));
    if (usuarioId) p = p.set('usuarioId', usuarioId);
    return p;
  }

  obtener(desde: string, hasta: string, usuarioId?: string): Observable<RegistroInforme[]> {
    return this.http.get<RegistroInforme[]>(this.url, { params: this.params(desde, hasta, usuarioId) });
  }

  descargarExcel(desde: string, hasta: string, usuarioId?: string): Observable<Blob> {
    return this.http.get(`${this.url}/excel`, {
      params: this.params(desde, hasta, usuarioId),
      responseType: 'blob',
    });
  }
}
