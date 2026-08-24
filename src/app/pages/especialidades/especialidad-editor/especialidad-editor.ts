/**
 * @file especialidad-editor.ts
 * @description Editor completo de una especialidad académica.
 * Cubre todas las secciones de la página pública: General, Imagen,
 * Malla Curricular, Coordinador, Perfil del Estudiante, Futuro Profesional,
 * Instalaciones, Admisiones, Testimonios y Publicación.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { EspecialidadService } from '../../../services/especialidad.service';
import { ActivityService } from '../../../services/activity';
import { IconService } from '../../../services/icon.service';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { ImageUrlInputComponent } from '../../../components/image-url-input/image-url-input.component';
import {
  Especialidad, Tab,
  AnioMalla,
} from '../../../models/api.models';

@Component({
  selector: 'app-especialidad-editor',
  standalone: true,
  templateUrl: './especialidad-editor.html',
  styleUrl: './especialidad-editor.css',
  imports: [FormsModule, CommonModule, SafeUrlPipe, ImageUrlInputComponent],
})
export class EspecialidadEditor implements OnInit {

  especialidad: Especialidad | undefined;
  cargando = true;
  errorCarga: string | null = null;
  breadcrumb = '';
  tabActiva = 'general';
  guardado = false;
  confirmarEliminar = false;
  mostrarSelectorIcono = false;

  /** Tabs del editor. */
  readonly tabs: Tab[] = [
    { id: 'general',     label: 'General'          },
    { id: 'imagenes',    label: 'Imágenes'         },
    { id: 'malla',       label: 'Malla Curricular' },
    { id: 'coordinador', label: 'Coordinador'      },
    { id: 'admisiones',  label: 'Admisiones'       },
    { id: 'testimonios', label: 'Testimonios'      },
    { id: 'publicacion', label: 'Publicación'      },
  ];

  /** Iconos disponibles para salidas profesionales. */
  readonly iconosSalida = [
    'gear','robot','computer','chip','terminal','wrench',
    'factory','hammer','car','engine','bolt','plug',
    'battery','users','book','clipboard','atom','microscope',
  ];

  constructor(
    private route:               ActivatedRoute,
    private location:            Location,
    private router:              Router,
    private especialidadService: EspecialidadService,
    private activityService:     ActivityService,
    public  iconService:         IconService,
  ) {}

  ngOnInit(): void {
    const nombre = history.state?.nombre;
    if (nombre) this.breadcrumb = nombre;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorCarga = 'ID de especialidad no válido.';
      this.cargando = false;
      return;
    }

    // Intentar cargar desde la lista en memoria primero (respuesta inmediata)
    const fromMemory = this.especialidadService.getAll().find(e => e._id === id);
    if (fromMemory) {
      this.especialidad = JSON.parse(JSON.stringify(fromMemory));
      this.inicializarSecciones();
      this.cargando = false;
    }

    // Siempre hacer el request HTTP para tener datos completos/frescos
    this.especialidadService.getById(id).subscribe({
      next: original => {
        this.especialidad = JSON.parse(JSON.stringify(original));
        this.inicializarSecciones();
        this.cargando = false;
        this.errorCarga = null;
      },
      error: (err) => {
        console.error('[EspecialidadEditor] Error al cargar por ID:', err?.status, err?.message);
        if (!this.especialidad) {
          // Sin datos en memoria: buscar en el listado reactivo como último recurso
          const listaActual = this.especialidadService.getAll();
          const fromList = listaActual.find(e => e._id === id);
          if (fromList) {
            this.especialidad = JSON.parse(JSON.stringify(fromList));
            this.inicializarSecciones();
            this.cargando = false;
          } else {
            this.errorCarga = `No se pudo cargar la especialidad (error ${err?.status ?? 'sin conexión'}). Verifica que el servidor esté activo.`;
            this.cargando = false;
          }
        }
        // Si ya tenemos datos en memoria, seguir mostrándolos
      },
    });
  }

  /**
   * Garantiza que todas las secciones opcionales existan con valores por defecto,
   * evitando errores de template al acceder a propiedades anidadas.
   */
  private inicializarSecciones(): void {
    if (!this.especialidad) return;
    const e = this.especialidad;

    e.duracion ??= '3 años';
    e.nivel    ??= 'Bachillerato';
    e.malla    = Array.isArray(e.malla) ? e.malla : [];

    // perfilCoordinador: puede llegar como string vacío desde el backend
    if (!e.perfilCoordinador || typeof e.perfilCoordinador !== 'object' || Array.isArray(e.perfilCoordinador)) {
      e.perfilCoordinador = { nombre: e.coordinador ?? '', cargo: '', foto: '', email: '', telefono: '' };
    } else {
      e.perfilCoordinador.nombre ??= e.coordinador ?? '';
      e.perfilCoordinador.cargo  ??= '';
      e.perfilCoordinador.foto   ??= '';
      e.perfilCoordinador.email  ??= '';
      e.perfilCoordinador.telefono ??= '';
    }

    // perfilEstudiante: backend devuelve [] (lista), frontend espera { descripcion, habilidades[] }
    if (!e.perfilEstudiante || Array.isArray(e.perfilEstudiante) || typeof e.perfilEstudiante !== 'object') {
      e.perfilEstudiante = { descripcion: '', habilidades: [] };
    } else {
      e.perfilEstudiante.descripcion ??= '';
      e.perfilEstudiante.habilidades  = Array.isArray(e.perfilEstudiante.habilidades)
        ? e.perfilEstudiante.habilidades : [];
    }

    // salidasProfesionales: backend devuelve [] de strings, frontend espera objetos
    if (!Array.isArray(e.salidasProfesionales)) {
      e.salidasProfesionales = [];
    } else {
      e.salidasProfesionales = e.salidasProfesionales
        .filter((s: any) => s && typeof s === 'object')
        .map((s: any) => ({
          id: s.id ?? Date.now(),
          icono: s.icono ?? 'gear',
          titulo: s.titulo ?? '',
          descripcion: s.descripcion ?? '',
        }));
    }

    e.instalaciones = Array.isArray(e.instalaciones) ? e.instalaciones : [];

    // admisiones: garantizar que botones siempre sea array
    if (!e.admisiones || typeof e.admisiones !== 'object' || Array.isArray(e.admisiones)) {
      e.admisiones = { texto: '', fechaImportante: '', labelFecha: 'Fecha de examen', botones: [] };
    } else {
      e.admisiones.texto          ??= '';
      e.admisiones.fechaImportante ??= '';
      e.admisiones.labelFecha     ??= 'Fecha de examen';
      e.admisiones.botones         = Array.isArray(e.admisiones.botones) ? e.admisiones.botones : [];
    }

    e.testimonios = Array.isArray(e.testimonios) ? e.testimonios : [];
    e.publicacion ??= { publicado: true, fechaPublicacion: '', visibleEnWeb: true };
  }

  // ─── Guardar / Eliminar ─────────────────────────────────────────────────────

  guardar(): void {
    if (!this.especialidad) return;
    // Sincronizar coordinador plano con el perfil completo
    if (this.especialidad.perfilCoordinador?.nombre) {
      this.especialidad.coordinador = this.especialidad.perfilCoordinador.nombre;
    }
    // Normalizar URL de YouTube al formato embed
    if (this.especialidad.videoUrl) {
      this.especialidad.videoUrl = this.toEmbedUrl(this.especialidad.videoUrl);
    }
    this.especialidadService.actualizar(this.especialidad).subscribe(() => {
      this.activityService.agregarActividad(
        'especialidad', 'Especialidad actualizada',
        `Se guardaron los cambios de "${this.especialidad!.titulo}".`
      );
      this.guardado = true;
    });
  }

  pedirEliminar(): void    { this.confirmarEliminar = true; }
  cancelarEliminar(): void { this.confirmarEliminar = false; }

  confirmarEliminarEspecialidad(): void {
    if (!this.especialidad) return;
    this.especialidadService.eliminar(this.especialidad._id).subscribe(() => {
      this.activityService.agregarActividad(
        'especialidad', 'Especialidad eliminada',
        `Se eliminó la especialidad "${this.especialidad!.titulo}".`
      );
      this.router.navigate(['/especialidades']);
    });
  }

  onCambio(): void { this.guardado = false; }

  volver(): void { this.location.back(); }

  /** Convierte cualquier URL de YouTube (watch/share) al formato embed requerido para iframes. */
  toEmbedUrl(url: string): string {
    if (!url) return '';
    // Ya es embed
    if (url.includes('youtube.com/embed/')) return url;
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&\s]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&\s]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return url;
  }

  /** Normaliza la URL de video al formato embed antes de guardar. */
  normalizarVideoUrl(): void {
    if (this.especialidad?.videoUrl) {
      this.especialidad.videoUrl = this.toEmbedUrl(this.especialidad.videoUrl);
    }
    this.onCambio();
  }

  // ─── Malla Curricular ───────────────────────────────────────────────────────

  agregarAnio(): void {
    if (!this.especialidad) return;
    const n = (this.especialidad.malla?.length ?? 0) + 1;
    const labels = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto'];
    this.especialidad.malla!.push({
      id: Date.now(),
      label: `${labels[n - 1] ?? `${n}°`} Año`,
      materias: [],
    });
    this.onCambio();
  }

  eliminarAnio(anioId: number): void {
    if (!this.especialidad) return;
    this.especialidad.malla = this.especialidad.malla!.filter(a => a.id !== anioId);
    this.onCambio();
  }

  agregarMateria(anio: AnioMalla): void {
    anio.materias.push({ id: Date.now(), nombre: '', horas: undefined });
    this.onCambio();
  }

  eliminarMateria(anio: AnioMalla, materiaId: number): void {
    anio.materias = anio.materias.filter(m => m.id !== materiaId);
    this.onCambio();
  }

  // ─── Perfil del Estudiante ──────────────────────────────────────────────────

  agregarHabilidad(): void {
    this.especialidad?.perfilEstudiante?.habilidades.push('');
    this.onCambio();
  }

  eliminarHabilidad(i: number): void {
    this.especialidad?.perfilEstudiante?.habilidades.splice(i, 1);
    this.onCambio();
  }

  trackByIndex(i: number): number { return i; }

  // ─── Salidas Profesionales ──────────────────────────────────────────────────

  agregarSalida(): void {
    this.especialidad?.salidasProfesionales?.push({
      id: Date.now(), icono: 'gear', titulo: '', descripcion: '',
    });
    this.onCambio();
  }

  eliminarSalida(id: number): void {
    if (!this.especialidad) return;
    this.especialidad.salidasProfesionales =
      this.especialidad.salidasProfesionales!.filter(s => s.id !== id);
    this.onCambio();
  }

  // ─── Instalaciones ──────────────────────────────────────────────────────────

  agregarInstalacion(): void {
    this.especialidad?.instalaciones?.push({ id: Date.now(), url: '', titulo: '' });
    this.onCambio();
  }

  eliminarInstalacion(id: number): void {
    if (!this.especialidad) return;
    this.especialidad.instalaciones =
      this.especialidad.instalaciones!.filter(i => i.id !== id);
    this.onCambio();
  }

  // ─── Admisiones ─────────────────────────────────────────────────────────────

  agregarBoton(): void {
    this.especialidad?.admisiones?.botones.push({
      id: Date.now(), label: '', url: '', estilo: 'primary',
    });
    this.onCambio();
  }

  eliminarBoton(id: number): void {
    if (!this.especialidad?.admisiones) return;
    this.especialidad.admisiones.botones =
      this.especialidad.admisiones.botones.filter(b => b.id !== id);
    this.onCambio();
  }

  // ─── Testimonios ────────────────────────────────────────────────────────────

  agregarTestimonio(): void {
    this.especialidad?.testimonios?.push({
      id: Date.now(), texto: '', autor: '', cargo: '',
    });
    this.onCambio();
  }

  eliminarTestimonio(id: number): void {
    if (!this.especialidad) return;
    this.especialidad.testimonios =
      this.especialidad.testimonios!.filter(t => t.id !== id);
    this.onCambio();
  }
}
