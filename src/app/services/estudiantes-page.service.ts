import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface GaleriaImagen  { id: number; url: string; alt: string; caption: string; }
export interface Club           { id: number; icon: string; title: string; description: string; }
export interface Promocion      { id: number; classOf: string; cursos?: { id: number; name: string; image: string; url?: string }[]; url?: string; }
export interface Instalacion    { id: number; title: string; description: string; image: string; }

export interface EstudiantesPageConfig {
  // Hero
  heroTitulo:       string;
  heroDescripcion:  string;
  heroImagen:       string;
  heroBoton1Label:  string;
  heroBoton1Url:    string;
  heroBoton2Label:  string;
  heroBoton2Url:    string;
  // Galería
  galeriaTitulo:    string;
  galeriaUrl:       string;
  galeria:          GaleriaImagen[];
  // Clubes
  clubesTitulo:     string;
  clubes:           Club[];
  // Promociones
  promocionesTitulo:       string;
  promocionesDescripcion:  string;
  promociones:             Promocion[];
  // Logros (título/URL de la sección — los ítems en sí viven en la colección /logros)
  logrosTitulo:     string;
  logrosUrl:        string;
  // Instalaciones
  instalacionesTitulo: string;
  instalaciones:       Instalacion[];
}

const DEFAULT: EstudiantesPageConfig = {
  heroTitulo:      'Experiencia en Campus',
  heroDescripcion: 'Únete a una comunidad vibrante de innovadores, creativos y líderes. Descubre dónde tu pasión se encuentra con el propósito en un ambiente diseñado para el crecimiento.',
  heroImagen:      '',
  heroBoton1Label: 'Tour Virtual',
  heroBoton1Url:   '',
  heroBoton2Label: 'Descargar Folleto',
  heroBoton2Url:   '',

  galeriaTitulo: 'Vida en Movimiento',
  galeriaUrl:    '',
  galeria: [
    { id: 1, url: '', alt: 'Laboratorio', caption: 'Laboratorios de Investigación Avanzada' },
    { id: 2, url: '', alt: 'Espacios verdes', caption: 'Espacios Verdes' },
    { id: 3, url: '', alt: 'Atletismo', caption: 'Atletismo' },
    { id: 4, url: '', alt: 'Campus', caption: 'Arquitectura Moderna del Campus' },
  ],

  clubesTitulo: 'Clubes y Organizaciones Estudiantiles',
  clubes: [
    { id: 1, icon: 'science',      title: 'Club de Ciencias',     description: 'Explora el mundo científico con experimentos y proyectos innovadores.' },
    { id: 2, icon: 'sports_soccer',title: 'Deportes',             description: 'Fútbol, básquet, atletismo y más actividades físicas para todos.' },
    { id: 3, icon: 'music_note',   title: 'Arte y Música',        description: 'Expresa tu creatividad a través del arte, la música y el teatro.' },
    { id: 4, icon: 'computer',     title: 'Club de Tecnología',   description: 'Programación, robótica y proyectos tecnológicos de vanguardia.' },
    { id: 5, icon: 'eco',          title: 'Medio Ambiente',       description: 'Iniciativas ecológicas y proyectos de sostenibilidad ambiental.' },
    { id: 6, icon: 'volunteer_activism', title: 'Voluntariado',   description: 'Servicio comunitario y proyectos de impacto social.' },
  ],

  promocionesTitulo:      'Nuestros Alumnos',
  promocionesDescripcion: 'Honrando el legado de excelencia de nuestros graduados. Cada generación marca un hito en nuestra historia académica.',
  promociones: [
    { id: 1, classOf: 'Promoción 2024', cursos: [{ id: 11, name: '', image: '', url: '' }], url: '' },
    { id: 2, classOf: 'Promoción 2023', cursos: [{ id: 12, name: '', image: '', url: '' }], url: '' },
    { id: 3, classOf: 'Promoción 2022', cursos: [{ id: 13, name: '', image: '', url: '' }], url: '' },
  ],

  logrosTitulo: 'Logros Estudiantiles',
  logrosUrl:    '/estudiantes/logros',

  instalacionesTitulo: 'Instalaciones de Clase Mundial',
  instalaciones: [
    { id: 1, title: 'Laboratorios Técnicos',  description: 'Equipados con tecnología de última generación para la formación práctica.',  image: '' },
    { id: 2, title: 'Biblioteca y Recursos',  description: 'Amplio acervo bibliográfico físico y digital para la investigación.',         image: '' },
    { id: 3, title: 'Áreas Deportivas',       description: 'Canchas, pista atlética y espacios para el desarrollo físico integral.',      image: '' },
  ],
};

@Injectable({ providedIn: 'root' })
export class EstudiantesPageService {
  private readonly clave = 'estudiantes_page';
  private configSubject = new BehaviorSubject<EstudiantesPageConfig>(this.clone(DEFAULT));
  config$ = this.configSubject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.cargar();
  }

  cargar(): void {
    this.configApi.get<Partial<EstudiantesPageConfig>>(this.clave).subscribe({
      next: datos => this.configSubject.next(this.mergeConfig(datos)),
      error: err => {
        console.error('[EstudiantesPageService] Error al cargar:', err);
        this.configSubject.next(this.clone(DEFAULT));
      },
    });
  }

  get(): EstudiantesPageConfig {
    return this.configSubject.value;
  }

  getCopia(): EstudiantesPageConfig { return this.clone(this.get()); }

  guardar(c: EstudiantesPageConfig): Observable<void> {
    const config = this.mergeConfig(c);
    return this.configApi.guardar(this.clave, config).pipe(
      tap(() => {
        this.configSubject.next(this.clone(config));
      }),
    );
  }

  nextId(): number { return Date.now(); }

  private mergeConfig(config?: Partial<EstudiantesPageConfig>): EstudiantesPageConfig {
    const base = {
      ...this.clone(DEFAULT),
      ...(config ?? {}),
      galeria: config?.galeria ?? this.clone(DEFAULT.galeria),
      clubes: config?.clubes ?? this.clone(DEFAULT.clubes),
      instalaciones: config?.instalaciones ?? this.clone(DEFAULT.instalaciones),
    } as EstudiantesPageConfig;

    // Normalizar promociones: soportar esquema antiguo { curso, image } y nuevo { cursos: [] }
    const incomingPromos: any[] = (config && (config as any).promociones) ? (config as any).promociones : this.clone(DEFAULT.promociones);
    base.promociones = incomingPromos.map(p => {
      const id = p.id ?? this.nextId();
      const classOf = p.classOf ?? '';
      const url = p.url ?? '';

      if (p.cursos && Array.isArray(p.cursos)) {
        return { id, classOf, cursos: p.cursos.map((c: any) => ({ id: c.id ?? this.nextId(), name: c.name ?? c.curso ?? '', image: c.image ?? '', url: c.url ?? '' })), url };
      }

      // antiguo formato con 'curso' y 'image'
      if (p.curso || p.image) {
        return { id, classOf, cursos: [{ id: this.nextId(), name: p.curso ?? '', image: p.image ?? '', url }], url };
      }

      // vacío
      return { id, classOf, cursos: [], url };
    });

    return base;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}


