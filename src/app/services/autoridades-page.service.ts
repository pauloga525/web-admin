import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface AutoridadesPageConfig {
  heroTitulo:         string;
  heroDescripcion:    string;
  heroImagenFondo:    string;
  seccionTitulo:      string;
  seccionDescripcion: string;
}

const DEFAULT: AutoridadesPageConfig = {
  heroTitulo:         'Autoridades',
  heroDescripcion:    'Conoce a los líderes que guían nuestra institución.',
  heroImagenFondo:    '',
  seccionTitulo:      'Equipo Directivo',
  seccionDescripcion: 'Nuestras autoridades están comprometidas con la excelencia educativa.',
};

@Injectable({ providedIn: 'root' })
export class AutoridadesPageService {
  private subject = new BehaviorSubject<AutoridadesPageConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<AutoridadesPageConfig>('autoridades_page').pipe(
      catchError(() => of({ ...DEFAULT }))
    ).subscribe(c => this.subject.next({ ...DEFAULT, ...(c ?? {}) }));
  }

  get(): AutoridadesPageConfig { return this.subject.value; }
  getCopia(): AutoridadesPageConfig { return JSON.parse(JSON.stringify(this.subject.value)); }

  guardar(c: AutoridadesPageConfig): Observable<void> {
    return this.configApi.guardar('autoridades_page', c).pipe(tap(() => this.subject.next(c)));
  }
}
