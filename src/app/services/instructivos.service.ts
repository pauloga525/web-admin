/**
 * @file instructivos.service.ts
 * @description Gestiona la configuración de página (hero, categorías) de "Instructivos".
 * Persiste en el backend (clave: 'instructivos_page') con fallback a localStorage.
 * Los instructivos en sí se gestionan como /recursos (tipo: 'pdf' | 'video'), ver RecursosApiService.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface InstructivoCategoria { id: number; icon: string; name: string; }

export interface InstructivosConfig {
  heroTitulo:      string;
  heroDescripcion: string;
  soporteUrl:      string;
  categorias:      InstructivoCategoria[];
}

const KEY = 'edu_instructivos_page';

const DEFAULT: InstructivosConfig = {
  heroTitulo:      'Instructivos y Tutoriales',
  heroDescripcion: 'Encuentra guías paso a paso, manuales en PDF y videotutoriales para dominar todas nuestras plataformas institucionales.',
  soporteUrl:      '/contacto',
  categorias: [
    { id: 1, icon: 'school',       name: 'Plataforma Educativa' },
    { id: 2, icon: 'computer',     name: 'Sistemas Informáticos' },
    { id: 3, icon: 'assignment',   name: 'Trámites y Secretaría' },
    { id: 4, icon: 'library_books',name: 'Biblioteca Digital'    },
  ],
};

@Injectable({ providedIn: 'root' })
export class InstructivosService {

  private subject = new BehaviorSubject<InstructivosConfig>(this.clone(DEFAULT));
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<InstructivosConfig>>('instructivos_page').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(err => of(err?.status === 404 ? this.clone(DEFAULT) : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c));
  }

  /**
   * Combina lo que venga del backend con DEFAULT — necesario porque un documento
   * guardado antes de agregar un campo nuevo no lo tendrá, y sin este merge
   * llegaría como `undefined` y rompería cualquier `.length`/`.push` del template.
   */
  private mergeConDefault(c?: Partial<InstructivosConfig> | null): InstructivosConfig {
    return {
      ...this.clone(DEFAULT),
      ...(c ?? {}),
      categorias: c?.categorias ?? this.clone(DEFAULT.categorias),
    };
  }

  private cargarLocal(): InstructivosConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? this.mergeConDefault(JSON.parse(raw)) : this.clone(DEFAULT);
    } catch { return this.clone(DEFAULT); }
  }

  get(): InstructivosConfig { return this.subject.value; }
  getCopia(): InstructivosConfig { return this.clone(this.subject.value); }

  guardar(c: InstructivosConfig): Observable<void> {
    return this.configApi.guardar('instructivos_page', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<InstructivosConfig> {
    return this.configApi.get<Partial<InstructivosConfig>>('instructivos_page').pipe(
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
