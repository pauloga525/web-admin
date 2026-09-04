/**
 * @file repositorios.service.ts
 * @description Gestiona el contenido de la página pública "Repositorio Digital".
 * Persiste en el backend (clave: 'repositorios') con fallback a localStorage.
 *
 * Antes este servicio SOLO guardaba en localStorage del navegador del admin
 * que editaba — nunca llegaba al backend, así que ningún cambio (en
 * ninguna de sus pestañas) podía reflejarse jamás en la página pública,
 * que vive en un servidor/app completamente distinta y no tiene forma de
 * leer el localStorage de otro navegador.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface RepoStat        { id: number; numero: string; etiqueta: string; }
export interface RepoColeccion   { id: number; icon: string; title: string; description: string; count: string; }
export interface RepoPublicacion { id: number; type: string; title: string; authors: string; date: string; access: 'open' | 'restricted'; }
export interface RepoNavLink     { id: number; icon: string; label: string; href: string; }

export interface RepositoriosConfig {
  // Hero
  heroBadgeIcon:  string;
  heroBadgeText:  string;
  heroTitulo:     string;
  heroSubtitulo:  string;
  heroStats:      RepoStat[];
  // Colecciones
  colecciones:    RepoColeccion[];
  // Publicaciones recientes
  pubTitulo:      string;
  pubVerTodoUrl:  string;
  publicaciones:  RepoPublicacion[];
  // Sidebar — guía
  guiaTitulo:     string;
  guiaTexto:      string;
  guiaUrl:        string;
  guiaBotonLabel: string;
  // Sidebar — navegación
  navTitulo:      string;
  navLinks:       RepoNavLink[];
  // Sidebar — soporte
  soporteHorario: string;
  soporteEmail:   string;
  // Sección enlaces de interés
  enlacesTitulo:  string;
}

const KEY = 'edu_repositorios';

const DEFAULT: RepositoriosConfig = {
  heroBadgeIcon:  'school',
  heroBadgeText:  'Archivo Institucional',
  heroTitulo:     'Repositorio Digital',
  heroSubtitulo:  'Preservando y difundiendo la producción intelectual, científica y académica de nuestra comunidad. Acceso abierto al conocimiento.',
  heroStats: [
    { id: 1, numero: '1,240+', etiqueta: 'Documentos Digitalizados' },
    { id: 2, numero: '850+',   etiqueta: 'Tesis de Grado'           },
  ],
  colecciones: [
    { id: 1, icon: 'school',       title: 'Tesis de Grado',        description: 'Trabajos de titulación de bachillerato.',          count: '850+'  },
    { id: 2, icon: 'article',      title: 'Artículos Científicos',  description: 'Publicaciones en revistas indexadas.',             count: '320+'  },
    { id: 3, icon: 'menu_book',    title: 'Libros y Capítulos',     description: 'Producción editorial de docentes e investigadores.', count: '140+' },
    { id: 4, icon: 'description',  title: 'Informes Técnicos',      description: 'Documentos técnicos y reportes institucionales.',  count: '130+'  },
  ],
  pubTitulo:     'Últimas Publicaciones',
  pubVerTodoUrl: '',
  publicaciones: [
    { id: 1, type: 'Tesis',    title: 'Diseño de sistema de control para brazo robótico',    authors: 'García, J.',   date: '2024', access: 'open'       },
    { id: 2, type: 'Artículo', title: 'Implementación de energías renovables en Ecuador',    authors: 'López, M.',    date: '2024', access: 'open'       },
    { id: 3, type: 'Informe',  title: 'Análisis de rendimiento académico 2023',              authors: 'UETS',         date: '2023', access: 'restricted' },
  ],
  guiaTitulo:     'Guía de Autoarchivo',
  guiaTexto:      '¿Deseas publicar tu tesis o investigación en el repositorio? Consulta nuestra guía paso a paso para estudiantes y docentes.',
  guiaUrl:        '',
  guiaBotonLabel: 'Ver Guía de Envío',
  navTitulo:      'Navegar por',
  navLinks: [
    { id: 1, icon: 'school',       label: 'Tesis y Proyectos',    href: '' },
    { id: 2, icon: 'article',      label: 'Artículos',            href: '' },
    { id: 3, icon: 'person',       label: 'Por Autor',            href: '' },
    { id: 4, icon: 'calendar_today', label: 'Por Año',            href: '' },
  ],
  soporteHorario: 'Lunes a Viernes 8:00 - 17:00',
  soporteEmail:   'biblioteca@uets.edu.ec',
  enlacesTitulo:  'Enlaces de Interés',
};

@Injectable({ providedIn: 'root' })
export class RepositoriosService {

  private subject = new BehaviorSubject<RepositoriosConfig>(this.clone(DEFAULT));
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<RepositoriosConfig>>('repositorios').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(err => of(err?.status === 404 ? this.clone(DEFAULT) : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c));
  }

  /**
   * Combina lo que venga del backend con DEFAULT — necesario porque
   * ConfiguracionApiService.get() convierte un 404 en {} en vez de lanzar
   * error. Sin este merge, los arrays (heroStats, colecciones,
   * publicaciones, navLinks) llegan como undefined y rompen el editor.
   */
  private mergeConDefault(c?: Partial<RepositoriosConfig> | null): RepositoriosConfig {
    return {
      ...this.clone(DEFAULT),
      ...(c ?? {}),
      heroStats:     c?.heroStats     ?? this.clone(DEFAULT.heroStats),
      colecciones:   c?.colecciones   ?? this.clone(DEFAULT.colecciones),
      publicaciones: c?.publicaciones ?? this.clone(DEFAULT.publicaciones),
      navLinks:      c?.navLinks      ?? this.clone(DEFAULT.navLinks),
    };
  }

  private cargarLocal(): RepositoriosConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? this.mergeConDefault(JSON.parse(raw)) : this.clone(DEFAULT);
    } catch { return this.clone(DEFAULT); }
  }

  get(): RepositoriosConfig { return this.subject.value; }
  getCopia(): RepositoriosConfig { return this.clone(this.subject.value); }

  guardar(c: RepositoriosConfig): Observable<void> {
    return this.configApi.guardar('repositorios', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  nextId(): number { return Date.now(); }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
