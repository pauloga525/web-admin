/**
 * @file models/index.ts
 * @description Modelos de datos centralizados de la aplicación.
 * Exporta todas las interfaces y tipos usados en componentes y servicios.
 */

// ─── Especialidades ───────────────────────────────────────────────────────────

/** Materia dentro de un año de la malla curricular. */
export interface Materia {
  id: number;
  nombre: string;
  horas?: number;
}

/** Año académico con sus materias. */
export interface AnioMalla {
  id: number;
  label: string;   // "Primer Año", "Segundo Año", etc.
  materias: Materia[];
}

/** Tarjeta de salida profesional. */
export interface SalidaProfesional {
  id: number;
  icono: string;   // nombre de icono SVG
  titulo: string;
  descripcion: string;
}

/** Imagen de galería de instalaciones. */
export interface ImagenInstalacion {
  id: number;
  url: string;
  titulo: string;
}

/** Botón de acción en la sección de admisiones. */
export interface BotonAdmision {
  id: number;
  label: string;
  url: string;
  estilo: 'primary' | 'outline';
}

/** Testimonio de un estudiante o egresado. */
export interface Testimonio {
  id: number;
  texto: string;
  autor: string;
  cargo?: string;
}

/** Perfil completo del coordinador de la especialidad. */
export interface PerfilCoordinador {
  nombre: string;
  cargo: string;
  foto: string;
  email: string;
  telefono: string;
}

/** Sección de admisiones. */
export interface SeccionAdmisiones {
  texto: string;
  fechaImportante: string;
  labelFecha: string;
  botones: BotonAdmision[];
}

/** Sección de perfil del estudiante. */
export interface PerfilEstudiante {
  descripcion: string;
  habilidades: string[];
}

/** Control de publicación. */
export interface Publicacion {
  publicado: boolean;
  fechaPublicacion: string;
  visibleEnWeb: boolean;
}

/** Representa una especialidad académica del instituto (modelo completo). */
export interface Especialidad {
  // ── Identificación ──────────────────────────────────────────────────────────
  _id?: string;   // MongoDB ObjectId (fuente de verdad)
  id?: number;    // Legado — preferir _id
  icono: string;
  color: string;
  codigo?: string;

  // ── General / Hero ──────────────────────────────────────────────────────────
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  tituloAObtener?: string;
  duracion?: string;
  nivel?: string;

  // ── Imagen ──────────────────────────────────────────────────────────────────
  imagenHero?: string;
  imagenSecundaria?: string;
  videoUrl?: string;

  // ── Malla Curricular ────────────────────────────────────────────────────────
  malla?: AnioMalla[];

  // ── Coordinador ─────────────────────────────────────────────────────────────
  coordinador: string;                    // nombre plano (usado en lista)
  perfilCoordinador?: PerfilCoordinador;  // perfil completo

  // ── Perfil del Estudiante ───────────────────────────────────────────────────
  perfilEstudiante?: PerfilEstudiante;

  // ── Futuro Profesional ──────────────────────────────────────────────────────
  salidasProfesionales?: SalidaProfesional[];

  // ── Instalaciones ───────────────────────────────────────────────────────────
  instalaciones?: ImagenInstalacion[];

  // ── Admisiones ──────────────────────────────────────────────────────────────
  admisiones?: SeccionAdmisiones;

  // ── Testimonios ─────────────────────────────────────────────────────────────
  testimonios?: Testimonio[];

  // ── Publicación ─────────────────────────────────────────────────────────────
  publicacion?: Publicacion;
}

// ─── Actividades ──────────────────────────────────────────────────────────────

/** Tipos de actividad registrables en el sistema. */
export type TipoActividad =
  | 'especialidad'
  | 'curso'
  | 'estudiante'
  | 'evento'
  | 'usuario'
  | 'sistema'
  | 'reporte';

/** Representa una entrada en el historial de actividad. */
export interface Actividad {
  tipo: TipoActividad;
  titulo: string;
  descripcion: string;
  fecha: Date;
}

/** Grupo de actividades agrupadas por fecha (Hoy, Ayer, etc.). */
export interface GrupoActividad {
  titulo: string;
  items: Actividad[];
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

/** Representa una notificación del sistema. */
export interface Notificacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: Date;
  leida: boolean;
  eliminada: boolean;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

/** Elemento de la ruta de navegación (breadcrumb). */
export interface BreadcrumbItem {
  label: string;
  url: string;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

/** Tab de navegación dentro de un editor o vista detallada. */
export interface Tab {
  id: string;
  label: string;
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

/** Ítem de la agenda/cronograma de un evento. */
export interface AgendaItem {
  id: number;
  hora: string;
  titulo: string;
  descripcion?: string;
}

/** Categoría de evento. */
export interface CategoriaEvento {
  id: number;
  nombre: string;
  color: string; // tailwind color key: blue, green, red, etc.
}

/** Formulario de registro de asistencia (estructura del campo). */
export interface RegistroAsistencia {
  habilitado: boolean;
  labelBoton: string;
  url?: string; // link externo o vacío si es formulario interno
}

/** Configuración del hero de la página pública de eventos. */
export interface HeroEventos {
  etiqueta: string;
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
}

/** Evento institucional completo. */
export interface Evento {
  // ── Identificación ──────────────────────────────────────────────────────────
  id: number;
  slug: string;

  // ── Contenido principal ─────────────────────────────────────────────────────
  titulo: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  categoria: string;       // nombre de la categoría
  categoriaColor: string;  // color tailwind de la categoría

  // ── Fecha y lugar ───────────────────────────────────────────────────────────
  fecha: string;           // ISO date string YYYY-MM-DD
  horaInicio: string;      // HH:mm
  horaFin: string;         // HH:mm
  ubicacion: string;
  direccion?: string;

  // ── Imágenes ────────────────────────────────────────────────────────────────
  imagenPrincipal: string;
  galeria?: string[];      // URLs adicionales

  // ── Agenda ──────────────────────────────────────────────────────────────────
  agenda?: AgendaItem[];

  // ── Registro ────────────────────────────────────────────────────────────────
  registro?: RegistroAsistencia;

  // ── Publicación ─────────────────────────────────────────────────────────────
  publicado: boolean;
  destacado: boolean;
  fechaCreacion: string;
}

// ─── Home Config ──────────────────────────────────────────────────────────────

/** Botón de acción genérico para el home. */
export interface HomeBoton {
  id: number;
  label: string;
  url: string;
  estilo: 'primary' | 'outline';
}

/** Hero principal del home. */
export interface HomeHero {
  imagenFondo: string;
  /** 'image' | 'video' — distingue cómo renderizar el fondo en el sitio público. */
  mediaType?: 'image' | 'video';
  etiqueta: string;
  titulo: string;
  textoDestacado: string;
  descripcion: string;
  botones: HomeBoton[];
}

/** Estadística institucional individual. */
export interface HomeEstadistica {
  id: number;
  valor: string;
  etiqueta: string;
}

/** Ítem de "¿Por qué elegirnos?". */
export interface HomePorQueItem {
  id: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

/** Nivel académico del home. */
export interface HomeNivel {
  id: number;
  imagen: string;
  nombre: string;
  descripcion: string;
  enlace: string;
}

/** Configuración de la sección Eventos en el home. */
export interface HomeEventos {
  tituloSeccion: string;
  labelBotonVerMas: string;
  urlBotonVerMas: string;
}

/** Logo de comunidad/aliado. */
export interface HomeLogo {
  id: number;
  url: string;
  nombre: string;
}

/** Característica del modelo educativo. */
export interface HomeCaracteristica {
  id: number;
  texto: string;
}

/** Sección institucional / modelo educativo. */
export interface HomeInstitucional {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  imagen: string;
  caracteristicas: HomeCaracteristica[];
}

/** Enlace de comunicación o interés. */
export interface HomeEnlace {
  id: number;
  nombre: string;
  url: string;
  imagen?: string;
}

/** Sección de admisiones del home. */
export interface HomeAdmisiones {
  titulo: string;
  descripcion: string;
  labelBoton: string;
  urlBoton: string;
  enlaces: HomeEnlace[];
}

/** Columna del footer. */
export interface HomeFooterColumna {
  titulo: string;
  enlaces: HomeEnlace[];
}

/** Footer del sitio. */
export interface HomeFooter {
  nombreInstitucion: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  columnas: HomeFooterColumna[];
}

/** Configuración completa del home. */
export interface HomeConfig {
  hero:          HomeHero;
  estadisticas:  HomeEstadistica[];
  porQue:        HomePorQueItem[];
  niveles:       HomeNivel[];
  eventos:       HomeEventos;
  logos:         HomeLogo[];
  institucional: HomeInstitucional;
  comunicacion:  HomeEnlace[];
  admisiones:    HomeAdmisiones;
  enlacesInteres:HomeEnlace[];
  footer:        HomeFooter;
}

// ─── Bachillerato Config ──────────────────────────────────────────────────────

/** Configuración de la página pública de Bachillerato. */
export interface BachilleratoConfig {
  // Hero
  heroImagenFondo: string;
  heroTitulo:      string;
  heroDescripcion: string;
  // CTA
  ctaTitulo:       string;
  ctaDescripcion:  string;
  ctaUrlDescarga:  string;  // URL del botón "Descargar Malla Curricular"
}
