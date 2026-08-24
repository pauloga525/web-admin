/**
 * @file configuracion-api.service.ts
 * @description Servicio genérico para leer/escribir configuraciones de páginas.
 * Reemplaza HomeService, CampusService, BibliotecaService, etc.
 *
 * Uso:
 *   this.configApi.get<HomeConfig>('home').subscribe(config => { ... });
 *   this.configApi.guardar('home', this.homeConfig).subscribe();
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionApiService {
  private readonly apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  /** Lee configuración (requiere JWT — para el panel admin). Retorna {} si no existe. */
  get<T>(clave: string): Observable<T> {
    return this.http
      .get<{ clave: string; datos: T }>(`${this.apiUrl}/${clave}`)
      .pipe(
        map(res => res.datos),
        catchError(err => {
          if (err?.status === 404) return of({} as T);
          throw err;
        }),
      );
  }

  /** Lee configuración pública (sin JWT — para el sitio web). Retorna {} si no existe. */
  getPublica<T>(clave: string): Observable<T> {
    return this.http
      .get<{ clave: string; datos: T }>(`${this.apiUrl}/publica/${clave}`)
      .pipe(
        map(res => res.datos),
        catchError(err => {
          if (err?.status === 404) return of({} as T);
          throw err;
        }),
      );
  }

  /** Guarda o actualiza una configuración por clave. */
  guardar<T>(clave: string, datos: T): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${clave}`, datos as object);
  }
}
