/**
 * @file boscometro-page.service.ts
 * @description Gestiona la configuración de página (imagen de fondo del hero) de
 * "Boscómetro". Persiste en el backend (clave: 'boscometro_page') — las tablas y
 * gráficos en sí se gestionan aparte como /recursos, ver RecursosApiService.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface BoscometroPageConfig {
  heroImagen: string;
}

const DEFAULT: BoscometroPageConfig = {
  heroImagen: '',
};

@Injectable({ providedIn: 'root' })
export class BoscometroPageService {

  private subject = new BehaviorSubject<BoscometroPageConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<BoscometroPageConfig>>('boscometro_page').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(() => of({ ...DEFAULT }))
    ).subscribe(c => this.subject.next(c));
  }

  private mergeConDefault(c?: Partial<BoscometroPageConfig> | null): BoscometroPageConfig {
    return { ...DEFAULT, ...(c ?? {}) };
  }

  get(): BoscometroPageConfig { return this.subject.value; }
  getCopia(): BoscometroPageConfig { return { ...this.subject.value }; }

  guardar(c: BoscometroPageConfig): Observable<void> {
    return this.configApi.guardar('boscometro_page', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<BoscometroPageConfig> {
    return this.configApi.get<Partial<BoscometroPageConfig>>('boscometro_page').pipe(
      map(c => this.mergeConDefault(c)),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }
}
