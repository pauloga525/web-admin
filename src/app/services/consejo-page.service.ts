/**
 * @file consejo-page.service.ts
 * @description Gestiona la configuración de página (imagen de fondo del hero) de
 * "Consejo Estudiantil". Persiste en el backend (clave: 'consejo_page'), igual que
 * instructivos_page/nosotros_page/etc. — los miembros en sí se gestionan aparte
 * como /consejo, ver ConsejoApiService.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface ConsejoPageConfig {
  heroImagen: string;
}

const DEFAULT: ConsejoPageConfig = {
  heroImagen: '',
};

@Injectable({ providedIn: 'root' })
export class ConsejoPageService {

  private subject = new BehaviorSubject<ConsejoPageConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<ConsejoPageConfig>>('consejo_page').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(() => of({ ...DEFAULT }))
    ).subscribe(c => this.subject.next(c));
  }

  private mergeConDefault(c?: Partial<ConsejoPageConfig> | null): ConsejoPageConfig {
    return { ...DEFAULT, ...(c ?? {}) };
  }

  get(): ConsejoPageConfig { return this.subject.value; }
  getCopia(): ConsejoPageConfig { return { ...this.subject.value }; }

  guardar(c: ConsejoPageConfig): Observable<void> {
    return this.configApi.guardar('consejo_page', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<ConsejoPageConfig> {
    return this.configApi.get<Partial<ConsejoPageConfig>>('consejo_page').pipe(
      map(c => this.mergeConDefault(c)),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }
}
