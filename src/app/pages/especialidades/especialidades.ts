/**
 * @file especialidades.ts
 * @description Página de gestión de especialidades académicas.
 * Conectada al backend NestJS — usa _id (string) en lugar de id (number).
 */
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EspecialidadService } from '../../services/especialidad.service';
import { ActivityService } from '../../services/activity';
import { IconService } from '../../services/icon.service';
import { ConfiguracionApiService } from '../../services/configuracion-api.service';
import { Especialidad, CreateEspecialidadDto } from '../../models/api.models';
import { BachilleratoConfig } from '../../models';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

const BADGE_COLOR: Record<string, string> = {
  purple:  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  blue:    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  orange:  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  red:     'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  yellow:  'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  cyan:    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  pink:    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  teal:    'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
};

@Component({
  selector: 'app-especialidades',
  imports: [NgClass, FormsModule, ImageUrlInputComponent],
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.css',
})
export class Especialidades implements OnInit, OnDestroy {

  especialidades: Especialidad[] = [];
  badgeColor = BADGE_COLOR;

  // ─── Editor de página Bachillerato ─────────────────────────────────────────
  paginaConfig: BachilleratoConfig = {
    heroImagenFondo: '', heroTitulo: '', heroDescripcion: '',
    ctaTitulo: '', ctaDescripcion: '', ctaUrlDescarga: '',
  };
  guardadoPagina   = false;
  editorAbierto    = false;
  tabPagina: 'hero' | 'cta' = 'hero';
  private guardadoTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Estado del modal ──────────────────────────────────────────────────────
  modalAbierto          = false;
  mostrarSelectorIconos = false;
  iconoSeleccionado     = '';
  guardandoModal        = false;
  errorModal            = '';

  // ─── Toast de éxito ────────────────────────────────────────────────────────
  mostrarExito            = false;
  tituloEspecialidadExito = '';
  private exitoTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * _id de la especialidad que se está editando.
   * null = modo creación.
   */
  especialidadEditando: string | null = null;

  nuevaEspecialidad = { titulo: '', descripcion: '', coordinador: '' };

  // ─── Estado de eliminación ─────────────────────────────────────────────────
  confirmarEliminar     = false;
  especialidadEliminar: Especialidad | null = null;

  // ─── Menú contextual ──────────────────────────────────────────────────────
  /** Almacena el _id del menú abierto (string en lugar de number). */
  menuAbierto: string | null = null;

  get iconosDisponibles(): string[] {
    return this.iconService.getIconKeys();
  }

  private subs = new Subscription();

  constructor(
    public  iconService:    IconService,
    private especialidadService: EspecialidadService,
    private activityService:     ActivityService,
    private configApi:           ConfiguracionApiService,
    public  router:              Router,
    private cdr:                 ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Carga configuración de la página pública
    this.configApi.get<BachilleratoConfig>('edu_bachillerato').subscribe({
      next:  cfg => this.paginaConfig = cfg,
      error: ()  => {},   // usa el valor por defecto si no existe aún
    });

    // Suscripción reactiva a la lista de especialidades
    this.subs.add(
      this.especialidadService.especialidades$.subscribe(lista => {
        this.especialidades = lista;
      }),
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ─── Editor página pública ─────────────────────────────────────────────────

  onCambioPagina(): void { this.guardadoPagina = false; }

  guardarPagina(): void {
    this.configApi.guardar('edu_bachillerato', this.paginaConfig).subscribe(() => {
      this.guardadoPagina = true;
      if (this.guardadoTimer) clearTimeout(this.guardadoTimer);
      this.guardadoTimer = setTimeout(() => this.guardadoPagina = false, 3000);
    });
  }

  // ─── Navegación ────────────────────────────────────────────────────────────
  // CAMBIO CLAVE: usa esp._id (string) en lugar de esp.id (number)

  irEspecialidad(esp: Especialidad): void {
    this.router.navigate(['/especialidades', esp._id], {
      state: { nombre: esp.titulo },
    });
  }

  // ─── Modal crear / editar ──────────────────────────────────────────────────

  abrirModal(): void { this.modalAbierto = true; }

  cerrarModal(): void {
    this.modalAbierto          = false;
    this.especialidadEditando  = null;
    this.iconoSeleccionado     = '';
    this.mostrarSelectorIconos = false;
    this.guardandoModal        = false;
    this.errorModal            = '';
    this.nuevaEspecialidad     = { titulo: '', descripcion: '', coordinador: '' };
  }

  seleccionarIcono(icono: string): void {
    this.iconoSeleccionado     = icono;
    this.mostrarSelectorIconos = false;
  }

  toggleIconos(): void { this.mostrarSelectorIconos = !this.mostrarSelectorIconos; }

  editarEspecialidad(esp: Especialidad): void {
    this.nuevaEspecialidad    = { titulo: esp.titulo, descripcion: esp.descripcion, coordinador: esp.coordinador };
    this.iconoSeleccionado    = esp.icono;
    this.especialidadEditando = esp._id;   // ← _id string
    this.menuAbierto          = null;
    this.modalAbierto         = true;
  }

  guardarEspecialidad(): void {
    const { titulo, descripcion, coordinador } = this.nuevaEspecialidad;
    if (!titulo || !descripcion || !coordinador || !this.iconoSeleccionado) return;

    this.guardandoModal = true;
    this.errorModal     = '';

    if (this.especialidadEditando !== null) {
      const anterior = this.especialidades.find(e => e._id === this.especialidadEditando);
      if (!anterior) { this.guardandoModal = false; return; }

      this.especialidadService.actualizar({
        ...anterior,
        icono: this.iconoSeleccionado,
        titulo, descripcion, coordinador,
      }).subscribe({
        next: () => {
          this.cerrarModal();
          this.cdr.detectChanges();
          try { this.activityService.agregarActividad('especialidad', 'Especialidad actualizada', `Se editó "${titulo}".`); } catch {}
          this.especialidadService.cargarTodas();
        },
        error: (err) => {
          this.guardandoModal = false;
          this.errorModal = `Error al guardar: ${err?.error?.detail ?? err?.message ?? 'Verifica la conexión'}`;
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateEspecialidadDto = {
        icono: this.iconoSeleccionado,
        titulo, descripcion, coordinador,
        color: 'blue',
        publicacion: { publicado: true, fechaPublicacion: '', visibleEnWeb: true },
      };
      this.especialidadService.agregar(dto).subscribe({
        next: () => {
          this.cerrarModal();
          this.cdr.detectChanges();
          this.tituloEspecialidadExito = titulo;
          this.mostrarExito = true;
          if (this.exitoTimer) clearTimeout(this.exitoTimer);
          this.exitoTimer = setTimeout(() => { this.mostrarExito = false; this.cdr.detectChanges(); }, 3000);
          try { this.activityService.agregarActividad('especialidad', 'Especialidad creada', `Se creó "${titulo}".`); } catch {}
          this.especialidadService.cargarTodas();
        },
        error: (err) => {
          this.guardandoModal = false;
          const msg = err?.error?.detail ?? err?.status ?? err?.message ?? 'Verifica la conexión';
          this.errorModal = `Error ${msg}`;
          this.cdr.detectChanges();
        },
      });
    }
  }

  // ─── Eliminación ───────────────────────────────────────────────────────────

  pedirEliminar(esp: Especialidad): void {
    this.especialidadEliminar = esp;
    this.confirmarEliminar    = true;
  }

  confirmarEliminarEspecialidad(): void {
    if (!this.especialidadEliminar) return;
    const { _id, titulo } = this.especialidadEliminar;

    this.especialidadEliminar = null;
    this.confirmarEliminar    = false;

    // Optimistic: remove immediately so UI updates without waiting for server
    this.especialidades = this.especialidades.filter(e => e._id !== _id);

    this.especialidadService.eliminar(_id).subscribe({
      next: () => {
        try { this.activityService.agregarActividad('especialidad', 'Especialidad eliminada', `Se eliminó "${titulo}".`); } catch {}
        this.especialidadService.cargarTodas();
      },
      error: () => {
        // Restore list if server fails
        this.especialidadService.cargarTodas();
      },
    });
  }

  cancelarEliminar(): void {
    this.confirmarEliminar    = false;
    this.especialidadEliminar = null;
  }

  // ─── Menú contextual ──────────────────────────────────────────────────────

  toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  @HostListener('document:click')
  cerrarMenu(): void { this.menuAbierto = null; }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.confirmarEliminar = false;
    this.menuAbierto       = null;
  }
}
