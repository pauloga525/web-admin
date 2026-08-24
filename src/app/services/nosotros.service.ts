/**
 * @file nosotros.service.ts
 * @description Gestiona el contenido de la página pública "Nosotros".
 * Persiste en el backend (clave: 'nosotros') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface MisionVisionItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface ValorItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface NosotrosConfig {
  heroTitulo:      string;
  heroDescripcion: string;
  misionVision:    MisionVisionItem[];
  valoresTitulo:    string;
  valoresSubtitulo: string;
  valores:          ValorItem[];
  historiaTitulo:      string;
  historiaDescripcion: string;
  historiaUrlRepositorio: string;
  timeline:            TimelineEvent[];
  autoridadesTitulo:    string;
  autoridadesSubtitulo: string;
  ctaTitulo:       string;
  ctaDescripcion:  string;
  ctaBoton1Label:  string;
  ctaBoton2Label:  string;
}

const KEY = 'edu_nosotros';

const DEFAULT: NosotrosConfig = {
  heroTitulo:      'Nuestra Institución',
  heroDescripcion: 'Formando líderes éticos y profesionales de excelencia para transformar el futuro del Ecuador y el mundo desde hace más de tres décadas.',
  misionVision: [
    { id: 1, icon: 'flag',       title: 'Misión', description: 'Formar personas íntegras con valores salesianos, competencias técnicas y científicas que contribuyan al desarrollo sostenible de la sociedad.' },
    { id: 2, icon: 'visibility', title: 'Visión', description: 'Ser una institución educativa de referencia nacional, reconocida por la excelencia académica, la innovación pedagógica y el compromiso con la comunidad.' },
  ],
  valoresTitulo:    'Valores Institucionales',
  valoresSubtitulo: 'Nuestra Esencia',
  valores: [
    { id: 1, icon: 'favorite',   title: 'Amor',       description: 'Actuamos con amor salesiano en cada interacción con nuestra comunidad educativa.' },
    { id: 2, icon: 'star',       title: 'Excelencia', description: 'Buscamos la mejora continua en todos los procesos académicos y administrativos.' },
    { id: 3, icon: 'group',      title: 'Comunidad',  description: 'Fomentamos el sentido de pertenencia y la colaboración entre todos los miembros.' },
    { id: 4, icon: 'menu_book',  title: 'Sabiduría',  description: 'Promovemos el conocimiento crítico y la formación integral del ser humano.' },
  ],
  historiaTitulo:      'Nuestra Historia',
  historiaDescripcion: 'Un legado de crecimiento y compromiso con la educación en Ecuador.',
  historiaUrlRepositorio: '',
  timeline: [
    { id: 1, year: '1970', title: 'Fundación',           description: 'Nace la institución con la misión salesiana de educar a los jóvenes más necesitados.',                image: '' },
    { id: 2, year: '1985', title: 'Bachillerato Técnico', description: 'Se implementan las primeras especialidades técnicas respondiendo a las necesidades del país.',       image: '' },
    { id: 3, year: '2000', title: 'Modernización',        description: 'Renovación de infraestructura y equipamiento tecnológico para el nuevo milenio.',                    image: '' },
    { id: 4, year: '2015', title: 'Acreditación',         description: 'Obtención de la acreditación nacional por excelencia académica y gestión institucional.',            image: '' },
    { id: 5, year: '2024', title: 'Transformación Digital', description: 'Implementación de plataformas digitales y metodologías innovadoras de enseñanza-aprendizaje.',   image: '' },
  ],
  autoridadesTitulo:    'Autoridades Académicas',
  autoridadesSubtitulo: 'Liderazgo visionario que guía el rumbo de nuestra institución.',
  ctaTitulo:      'Sé parte del futuro hoy',
  ctaDescripcion: 'Descubre cómo nuestra propuesta académica puede potenciar tu talento y llevar tus ambiciones al siguiente nivel.',
  ctaBoton1Label: 'Únete a nuestra comunidad',
  ctaBoton2Label: 'Contactar Admisiones',
};

@Injectable({ providedIn: 'root' })
export class NosotrosService {

  private subject = new BehaviorSubject<NosotrosConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<NosotrosConfig>('nosotros').pipe(
      catchError(err => of(err?.status === 404 ? { ...DEFAULT } : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c ?? DEFAULT));
  }

  private cargarLocal(): NosotrosConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }

  get(): NosotrosConfig { return this.subject.value; }

  getCopia(): NosotrosConfig { return JSON.parse(JSON.stringify(this.subject.value)); }

  guardar(c: NosotrosConfig): Observable<void> {
    return this.configApi.guardar('nosotros', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<NosotrosConfig> {
    return this.configApi.get<NosotrosConfig>('nosotros').pipe(
      map(c => ({
        ...DEFAULT,
        ...c,
        misionVision: Array.isArray(c.misionVision) && c.misionVision.length ? c.misionVision : DEFAULT.misionVision,
        valores:      Array.isArray(c.valores)      && c.valores.length      ? c.valores      : DEFAULT.valores,
        timeline:     Array.isArray(c.timeline)     && c.timeline.length     ? c.timeline     : DEFAULT.timeline,
      })),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }

  nextId(): number { return Date.now(); }
}

