import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface NoticiasPageConfig {
  heroTitulo:       string;
  heroDescripcion:  string;
  heroImagenFondo:  string;
  destacadasTitulo: string;
  listadoTitulo:    string;
  categorias:       string[];
}

const DEFAULT: NoticiasPageConfig = {
  heroTitulo:       'Noticias',
  heroDescripcion:  'Mantente informado sobre lo que ocurre en nuestra institución.',
  heroImagenFondo:  '',
  destacadasTitulo: 'Noticias Destacadas',
  listadoTitulo:    'Todas las Noticias',
  categorias:       ['Académico', 'Deportes', 'Cultural', 'Institucional'],
};

@Injectable({ providedIn: 'root' })
export class NoticiasPageService {
  private subject = new BehaviorSubject<NoticiasPageConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<NoticiasPageConfig>('noticias_page').pipe(
      catchError(() => of({ ...DEFAULT }))
    ).subscribe(c => this.subject.next({ ...DEFAULT, ...(c ?? {}) }));
  }

  get(): NoticiasPageConfig { return this.subject.value; }
  getCopia(): NoticiasPageConfig { return JSON.parse(JSON.stringify(this.subject.value)); }

  guardar(c: NoticiasPageConfig): Observable<void> {
    return this.configApi.guardar('noticias_page', c).pipe(tap(() => this.subject.next(c)));
  }
}
