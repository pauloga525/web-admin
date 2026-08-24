/**
 * @file api.models.ts
 * @description Modelos alineados con el backend MongoDB/NestJS.
 *
 * REGLA CENTRAL:
 *   - El backend devuelve `_id: string` (ObjectId serializado).
 *   - Los templates usan `_id` en track, routerLink y operaciones CRUD.
 *   - Los sub-documentos embebidos (malla, agenda, etc.) conservan `id: number`
 *     porque son arrays locales sin colección propia en Mongo.
 *   - `createdAt` y `updatedAt` son strings ISO 8601 (JSON serializa Date → string).
 */

// ─── Base ─────────────────────────────────────────────────────────────────────

/** Todo documento raíz de MongoDB tiene estos campos. */
export interface MongoDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Sub-documentos (sin _id propio, conservan id: number) ───────────────────

export interface Materia {
  id: number;
  nombre: string;
  horas?: number;
}

export interface AnioMalla {
  id: number;
  label: string;
  materias: Materia[];
}

export interface SalidaProfesional {
  id: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface ImagenInstalacion {
  id: number;
  url: string;
  titulo: string;
}

export interface BotonAdmision {
  id: number;
  label: string;
  url: string;
  estilo: 'primary' | 'outline';
}

export interface Testimonio {
  id: number;
  texto: string;
  autor: string;
  cargo?: string;
}

export interface PerfilCoordinador {
  nombre: string;
  cargo: string;
  foto: string;
  email: string;
  telefono: string;
}

export interface PerfilEstudiante {
  descripcion: string;
  habilidades: string[];
}

export interface SeccionAdmisiones {
  texto: string;
  fechaImportante: string;
  labelFecha: string;
  botones: BotonAdmision[];
}

export interface PublicacionConfig {
  publicado: boolean;
  fechaPublicacion: string;
  visibleEnWeb: boolean;
}

// ─── Especialidad ─────────────────────────────────────────────────────────────

export interface Especialidad extends MongoDocument {
  icono: string;
  color: string;
  codigo?: string;

  titulo: string;
  subtitulo?: string;
  descripcion: string;
  tituloAObtener?: string;
  duracion?: string;
  nivel?: string;

  imagenHero?: string;
  imagenSecundaria?: string;
  videoUrl?: string;

  malla?: AnioMalla[];
  coordinador: string;
  perfilCoordinador?: PerfilCoordinador;
  perfilEstudiante?: PerfilEstudiante;
  salidasProfesionales?: SalidaProfesional[];
  instalaciones?: ImagenInstalacion[];
  admisiones?: SeccionAdmisiones;
  testimonios?: Testimonio[];
  publicacion?: PublicacionConfig;
}

/** DTO para crear/actualizar (sin campos de Mongo). */
export type CreateEspecialidadDto = Omit<Especialidad, '_id' | 'createdAt' | 'updatedAt'>;

// ─── Eventos ──────────────────────────────────────────────────────────────────

export interface AgendaItem {
  id: number;
  hora: string;
  titulo: string;
  descripcion?: string;
}

export interface RegistroAsistencia {
  habilitado: boolean;
  labelBoton: string;
  url?: string;
}

export interface Evento extends MongoDocument {
  slug: string;
  titulo: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  categoria: string;
  categoriaColor: string;
  fecha: string;        // YYYY-MM-DD
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  direccion?: string;
  imagenPrincipal: string;
  galeria?: string[];
  agenda?: AgendaItem[];
  registro?: RegistroAsistencia;
  publicado: boolean;
  destacado: boolean;
}

export type CreateEventoDto = Omit<Evento, '_id' | 'createdAt' | 'updatedAt'>;

/** Respuesta paginada del endpoint GET /eventos/publicos */
export interface EventosPaginados {
  items: Evento[];
  total: number;
}

// ─── Categoría de evento (colección separada en el futuro, por ahora config) ──

export interface CategoriaEvento {
  id: number;   // conserva number porque se gestiona en configuracion
  nombre: string;
  color: string;
}

export interface HeroEventos {
  etiqueta: string;
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
}

// ─── Noticias ─────────────────────────────────────────────────────────────────

export interface NoticiaImagen {
  id: number;
  url: string;
  alt: string;
}

export interface Noticia extends MongoDocument {
  tag: string;
  title: string;
  description: string;
  image: string;
  destacada: boolean;
  category: string;
  featuredImage: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  content: string;
  images: NoticiaImagen[];
  tags: string[];
  publicada: boolean;
}

export type CreateNoticiaDto = Omit<Noticia, '_id' | 'createdAt' | 'updatedAt'>;

// ─── Autoridades ──────────────────────────────────────────────────────────────

export interface Autoridad extends MongoDocument {
  name: string;
  title: string;
  categoryLabel: string;
  image: string;
  email: string;
  specialization: string;
  linkedin: string;
  fullBio: string;
  ubicacion: string;
  horario: string;
  telefono: string;
}

export type CreateAutoridadDto = Omit<Autoridad, '_id' | 'createdAt' | 'updatedAt'>;

// ─── Estudiantes ──────────────────────────────────────────────────────────────

export type EstadoEstudiante = 'activo' | 'inactivo' | 'egresado';

export interface Estudiante extends MongoDocument {
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  especialidad: string;
  curso: string;
  foto: string;
  anioLectivo: number;
  estado: EstadoEstudiante;
}

export type CreateEstudianteDto = Omit<Estudiante, '_id' | 'createdAt' | 'updatedAt'>;

// ─── Logros ───────────────────────────────────────────────────────────────────

export interface Logro extends MongoDocument {
  badge: string;
  badgeClass: string;
  date: string;
  title: string;
  category: string;
  description: string;
  image: string;
  featured: boolean;
  publicado: boolean;
}

export type CreateLogroDto = Omit<Logro, '_id' | 'createdAt' | 'updatedAt'>;

// ─── Actividad ────────────────────────────────────────────────────────────────

export type TipoActividad =
  | 'especialidad' | 'curso' | 'estudiante'
  | 'evento' | 'usuario' | 'sistema' | 'reporte';

export interface Actividad extends MongoDocument {
  tipo: TipoActividad;
  titulo: string;
  descripcion: string;
  fecha: string;   // ISO string (Date serializado)
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

export interface Notificacion extends MongoDocument {
  userId: string;
  titulo: string;
  descripcion: string;
  leida: boolean;
  eliminada: boolean;
  fecha: string;
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export type UserRole   = 'super_admin' | 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface AppUser extends MongoDocument {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  cargo: string;
  avatar: string;
  rol: UserRole;
  status: UserStatus;
  // password nunca viene del backend
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  user: Omit<AppUser, 'createdAt' | 'updatedAt'>;
}

// ─── Configuración genérica ───────────────────────────────────────────────────

export interface ConfiguracionDoc extends MongoDocument {
  clave: string;
  datos: Record<string, unknown>;
}

// ─── Grupos de actividad (solo frontend, no viene del backend) ────────────────

export interface GrupoActividad {
  titulo: string;
  items: Actividad[];
}

// ─── Breadcrumb / UI (solo frontend) ─────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  url: string;
}

export interface Tab {
  id: string;
  label: string;
}
