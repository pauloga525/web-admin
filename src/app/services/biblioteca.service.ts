/**
 * @file biblioteca.service.ts
 * @description Gestiona la configuración de página (hero, categorías) de "Biblioteca".
 * Persiste en el backend (clave: 'biblioteca_page') con fallback a localStorage.
 * Los libros en sí se gestionan como /recursos (tipo: 'libro'), ver RecursosApiService.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface LibroCategoria { id: number; nombre: string; }

export interface BibliotecaConfig {
  heroTitulo:      string;
  heroDescripcion: string;
  catalogoTitulo:  string;
  categorias:      LibroCategoria[];
}

const KEY = 'edu_biblioteca_page';

const DEFAULT: BibliotecaConfig = {
  heroTitulo:      'Biblioteca UETS',
  heroDescripcion: 'Centro de recursos para el aprendizaje y la investigación. Accede a nuestro catálogo global, reserva espacios de estudio y descubre las últimas novedades editoriales.',
  catalogoTitulo:  'Catálogo de Libros',
  categorias: [
    { id: 1, nombre: 'Todo el catálogo' },
    { id: 2, nombre: 'Libros físicos'   },
    { id: 3, nombre: 'E-books'          },
    { id: 4, nombre: 'Tesis'            },
  ],
};

@Injectable({ providedIn: 'root' })
export class BibliotecaService {

  private subject = new BehaviorSubject<BibliotecaConfig>(this.clone(DEFAULT));
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<BibliotecaConfig>>('biblioteca_page').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(err => of(err?.status === 404 ? this.clone(DEFAULT) : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c));
  }

  /**
   * Combina lo que venga del backend con DEFAULT — necesario porque un documento
   * guardado antes de agregar un campo nuevo no lo tendrá, y sin este merge
   * llegaría como `undefined` y rompería cualquier `.length`/`.push` del template.
   */
  private mergeConDefault(c?: Partial<BibliotecaConfig> | null): BibliotecaConfig {
    return {
      ...this.clone(DEFAULT),
      ...(c ?? {}),
      categorias: c?.categorias ?? this.clone(DEFAULT.categorias),
    };
  }

  private cargarLocal(): BibliotecaConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? this.mergeConDefault(JSON.parse(raw)) : this.clone(DEFAULT);
    } catch { return this.clone(DEFAULT); }
  }

  get(): BibliotecaConfig { return this.subject.value; }
  getCopia(): BibliotecaConfig { return this.clone(this.subject.value); }

  guardar(c: BibliotecaConfig): Observable<void> {
    return this.configApi.guardar('biblioteca_page', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<BibliotecaConfig> {
    return this.configApi.get<Partial<BibliotecaConfig>>('biblioteca_page').pipe(
      map(c => this.mergeConDefault(c)),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }

  nextId(): number { return Date.now(); }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
