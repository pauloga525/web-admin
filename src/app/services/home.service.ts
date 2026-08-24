/**
 * @file home.service.ts
 * @description Gestión del contenido de la página principal.
 * Persiste en el backend via ConfiguracionApiService (clave: 'home').
 * Mantiene localStorage como fallback offline.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';
import {
  HomeConfig, HomeBoton, HomePorQueItem, HomeNivel,
  HomeLogo, HomeCaracteristica, HomeEnlace, HomeFooterColumna,
} from '../models';
import { environment } from '../../environments/environment';

const KEY = 'home_config';

const DEFAULT: HomeConfig = {
  hero: {
    imagenFondo: '',
    etiqueta: 'Unidad Educativa Técnica Salesiana',
    titulo: 'Formando líderes del futuro',
    textoDestacado: 'Excelencia académica y técnica',
    descripcion: 'Ofrecemos una educación integral que combina valores, tecnología y habilidades técnicas para preparar a nuestros estudiantes para los desafíos del mundo moderno.',
    botones: [
      { id: 1, label: 'Conoce nuestras especialidades', url: '/especialidades', estilo: 'primary' },
      { id: 2, label: 'Proceso de admisión', url: '/admisiones', estilo: 'outline' },
    ],
  },
  estadisticas: [
    { id: 1, valor: '1200+', etiqueta: 'Estudiantes' },
    { id: 2, valor: '1',     etiqueta: 'Campus' },
    { id: 3, valor: '80+',   etiqueta: 'Docentes' },
    { id: 4, valor: '50+',   etiqueta: 'Años de experiencia' },
  ],
  porQue: [
    { id: 1, icono: 'book',     titulo: 'Educación de calidad',    descripcion: 'Programas académicos actualizados y alineados con estándares internacionales.' },
    { id: 2, icono: 'gear',     titulo: 'Formación técnica',       descripcion: 'Talleres y laboratorios equipados con tecnología de punta.' },
    { id: 3, icono: 'users',    titulo: 'Comunidad salesiana',     descripcion: 'Un ambiente de respeto, valores y crecimiento personal.' },
    { id: 4, icono: 'computer', titulo: 'Innovación tecnológica',  descripcion: 'Integración de herramientas digitales en el proceso de aprendizaje.' },
  ],
  niveles: [
    { id: 1, imagen: '', nombre: 'Educación Básica',     descripcion: 'Formación integral para niños y jóvenes.',    enlace: '/niveles/basica'       },
    { id: 2, imagen: '', nombre: 'Bachillerato General', descripcion: 'Preparación para la educación superior.',     enlace: '/niveles/bachillerato' },
    { id: 3, imagen: '', nombre: 'Bachillerato Técnico', descripcion: 'Especialidades técnicas con salida laboral.', enlace: '/especialidades'       },
  ],
  eventos: {
    tituloSeccion: 'Próximos Eventos',
    labelBotonVerMas: 'Ver todos los eventos',
    urlBotonVerMas: '/eventos',
  },
  logos: [],
  institucional: {
    titulo: 'Nuestro Modelo Educativo',
    subtitulo: 'Educación salesiana de excelencia',
    descripcion: 'Basados en el sistema preventivo de Don Bosco, formamos personas íntegras con valores sólidos y competencias técnicas.',
    imagen: '',
    caracteristicas: [
      { id: 1, texto: 'Sistema preventivo salesiano' },
      { id: 2, texto: 'Enfoque en valores y ética' },
      { id: 3, texto: 'Vinculación con la comunidad' },
      { id: 4, texto: 'Innovación pedagógica continua' },
    ],
  },
  comunicacion: [
    { id: 1, nombre: 'Portal de estudiantes', url: '', imagen: '' },
    { id: 2, nombre: 'Plataforma virtual',    url: '', imagen: '' },
    { id: 3, nombre: 'Biblioteca digital',    url: '', imagen: '' },
  ],
  admisiones: {
    titulo: 'Proceso de Admisión',
    descripcion: 'Inicia tu proceso de inscripción para el año lectivo. Cupos limitados.',
    labelBoton: 'Iniciar inscripción',
    urlBoton: '/admisiones',
    enlaces: [
      { id: 1, nombre: 'Requisitos de admisión',        url: '' },
      { id: 2, nombre: 'Calendario de inscripciones',   url: '' },
    ],
  },
  enlacesInteres: [
    { id: 1, nombre: 'Ministerio de Educación', url: 'https://educacion.gob.ec', imagen: '' },
    { id: 2, nombre: 'SENESCYT',                url: 'https://senescyt.gob.ec',  imagen: '' },
  ],
  footer: {
    nombreInstitucion: 'Unidad Educativa Técnica Salesiana',
    descripcion: 'Formando líderes con valores y excelencia académica desde hace más de 50 años.',
    direccion: 'Av. Principal s/n, Cuenca, Ecuador',
    telefono: '+593 7 000 0000',
    email: 'info@uets.edu.ec',
    columnas: [
      { titulo: 'Institución', enlaces: [{ id: 1, nombre: 'Quiénes somos', url: '/nosotros' }, { id: 2, nombre: 'Misión y visión', url: '/mision' }] },
      { titulo: 'Académico',   enlaces: [{ id: 1, nombre: 'Especialidades', url: '/especialidades' }, { id: 2, nombre: 'Bachillerato', url: '/bachillerato' }] },
    ],
  },
};

@Injectable({ providedIn: 'root' })
export class HomeService {

  private subject = new BehaviorSubject<HomeConfig>(DEFAULT);
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<HomeConfig>('home').pipe(
      catchError((err) => {
        // 404 = aún no existe en la BD → usar DEFAULT como punto de partida
        // Otros errores (401, red) → usar localStorage como fallback
        if (err?.status === 404) return of(DEFAULT);
        return of(this.cargarLocal());
      })
    ).subscribe(config => {
      let resolved: HomeConfig = config ?? DEFAULT;
      // Unwrap legacy double-nested data: { datos: HomeConfig } stored by old saves
      if (!resolved.hero && (resolved as any)?.datos?.hero) {
        resolved = (resolved as any).datos as HomeConfig;
      }
      // Merge with DEFAULT so all required fields are always present
      resolved = { ...DEFAULT, ...resolved, hero: { ...DEFAULT.hero, ...(resolved.hero ?? {}) } };
      // Normalize GridFS URLs to current apiUrl (fixes images saved with a different host/IP)
      resolved = this.normalizeGridfsUrls(resolved);
      localStorage.setItem(KEY, JSON.stringify(resolved));
      this.subject.next(resolved);
    });
  }

  private cargarLocal(): HomeConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch { return DEFAULT; }
  }

  get(): HomeConfig { return this.subject.value; }

  guardar(config: HomeConfig): Observable<void> {
    return this.configApi.guardar('home', config).pipe(
      tap(() => this.subject.next(config))
    );
  }

  getCopia(): HomeConfig { return JSON.parse(JSON.stringify(this.subject.value)); }
  nextId(): number { return Date.now(); }

  private normalizeGridfsUrls<T>(obj: T): T {
    if (typeof obj === 'string') {
      if (obj.includes('/api/v1/imagenes/gridfs/')) {
        const id = obj.split('/api/v1/imagenes/gridfs/').pop();
        return `${environment.apiUrl}/imagenes/gridfs/${id}` as unknown as T;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(i => this.normalizeGridfsUrls(i)) as unknown as T;
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const k in obj) result[k] = this.normalizeGridfsUrls((obj as Record<string, unknown>)[k]);
      return result as T;
    }
    return obj;
  }
}

