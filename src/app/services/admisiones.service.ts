/**
 * @file admisiones.service.ts
 * @description Gestiona el contenido de la página de Admisiones.
 * Persiste en el backend (clave: 'admisiones') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface AdmisionStep     { id: number; stepNumber: number; icon: string; title: string; description: string; }
export interface AdmisionReq      { id: number; icon: string; title: string; description: string; }
export interface AdmisionDownload { id: number; icon: string; label: string; url: string; }
export interface AdmisionDate     { id: number; title: string; subtitle: string; date: string; year: string; isPrimary: boolean; }

export interface AdmisionesConfig {
  heroBadge:        string;
  heroTitulo:       string;
  heroDescripcion:  string;
  heroImagenFondo:  string;
  heroBoton1Label:  string;
  heroBoton1Url:    string;
  heroBoton2Label:  string;
  heroBoton2Url:    string;
  procesoTitulo:       string;
  procesoDescripcion:  string;
  steps:               AdmisionStep[];
  requisitosTitulo:    string;
  requisitos:          AdmisionReq[];
  descargasTitulo:     string;
  descargas:           AdmisionDownload[];
  fechasTitulo:        string;
  fechas:              AdmisionDate[];
  urlCalendario:       string;
  ctaTitulo:       string;
  ctaDescripcion:  string;
  ctaBotonLabel:   string;
  ctaBotonUrl:     string;
}

const KEY = 'edu_admisiones';

const DEFAULT: AdmisionesConfig = {
  heroBadge:       'Período Lectivo 2024-2025',
  heroTitulo:      'Admisiones 2024',
  heroDescripcion: 'Tu futuro comienza aquí. Únete a una comunidad de innovadores, líderes y pensadores.',
  heroImagenFondo: '',
  heroBoton1Label: 'Inicia tu Solicitud',
  heroBoton1Url:   '',
  heroBoton2Label: 'Descargar Guía',
  heroBoton2Url:   '',
  procesoTitulo:      'Proceso de Admisión',
  procesoDescripcion: 'Sigue estos cuatro sencillos pasos para convertirte en parte de nuestra comunidad académica.',
  steps: [
    { id: 1, stepNumber: 1, icon: 'app_registration', title: 'Solicitud en Línea',    description: 'Completa el formulario de solicitud con tus datos personales y académicos.' },
    { id: 2, stepNumber: 2, icon: 'folder_open',      title: 'Entrega de Documentos', description: 'Presenta los documentos requeridos en secretaría o de forma digital.' },
    { id: 3, stepNumber: 3, icon: 'quiz',             title: 'Evaluación',             description: 'Participa en la evaluación de conocimientos y entrevista personal.' },
    { id: 4, stepNumber: 4, icon: 'celebration',      title: 'Bienvenida',             description: 'Recibe tu carta de aceptación y completa el proceso de matrícula.' },
  ],
  requisitosTitulo: 'Requisitos',
  requisitos: [
    { id: 1, icon: 'description',  title: 'Partida de Nacimiento',    description: 'Original y copia notariada.' },
    { id: 2, icon: 'badge',        title: 'Cédula de Identidad',      description: 'Del estudiante y representante legal.' },
    { id: 3, icon: 'school',       title: 'Certificado de Estudios',  description: 'Del año inmediato anterior aprobado.' },
    { id: 4, icon: 'photo_camera', title: 'Fotografías',              description: '2 fotos tamaño carné fondo blanco.' },
    { id: 5, icon: 'vaccines',     title: 'Carnet de Vacunas',        description: 'Esquema de vacunación actualizado.' },
    { id: 6, icon: 'home',         title: 'Comprobante de Domicilio', description: 'Planilla de servicios básicos reciente.' },
  ],
  descargasTitulo: 'Descargas Esenciales',
  descargas: [
    { id: 1, icon: 'picture_as_pdf', label: 'Formulario de Solicitud', url: '' },
    { id: 2, icon: 'checklist',      label: 'Lista de Requisitos',     url: '' },
    { id: 3, icon: 'calendar_month', label: 'Calendario Académico',    url: '' },
  ],
  fechasTitulo: 'Fechas Importantes',
  fechas: [
    { id: 1, title: 'Inicio de Inscripciones', subtitle: 'Apertura del período de solicitudes',  date: '15 Ene',   year: '2024', isPrimary: true  },
    { id: 2, title: 'Cierre de Inscripciones', subtitle: 'Último día para enviar solicitudes',   date: '28 Feb',   year: '2024', isPrimary: false },
    { id: 3, title: 'Evaluaciones',            subtitle: 'Pruebas de conocimiento y entrevistas', date: '10 Mar',  year: '2024', isPrimary: true  },
    { id: 4, title: 'Publicación Resultados',  subtitle: 'Notificación de aceptados',            date: '20 Mar',   year: '2024', isPrimary: false },
    { id: 5, title: 'Período de Matrícula',    subtitle: 'Formalización de la inscripción',      date: '1-15 Abr', year: '2024', isPrimary: true  },
  ],
  urlCalendario: '',
  ctaTitulo:      '¿Listo para dar forma a tu futuro?',
  ctaDescripcion: 'No pierdas la oportunidad de unirte a nuestra comunidad.',
  ctaBotonLabel:  'Inicia tu Solicitud',
  ctaBotonUrl:    '',
};

@Injectable({ providedIn: 'root' })
export class AdmisionesService {

  private subject = new BehaviorSubject<AdmisionesConfig>({ ...DEFAULT });
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<AdmisionesConfig>('admisiones').pipe(
      catchError(err => of(err?.status === 404 ? { ...DEFAULT } : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c ?? DEFAULT));
  }

  private cargarLocal(): AdmisionesConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }

  get(): AdmisionesConfig { return this.subject.value; }
  getCopia(): AdmisionesConfig { return JSON.parse(JSON.stringify(this.subject.value)); }

  guardar(c: AdmisionesConfig): Observable<void> {
    return this.configApi.guardar('admisiones', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<AdmisionesConfig> {
    return this.configApi.get<AdmisionesConfig>('admisiones').pipe(
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }

  nextId(): number { return Date.now(); }
}


