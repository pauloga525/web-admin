/**
 * @file eventos.ts
 * @description Módulo administrativo de gestión de eventos institucionales.
 * Conectado al backend NestJS — usa _id (string) en lugar de id (number).
 */
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventoService } from '../../services/evento.service';
import { ActivityService } from '../../services/activity';
import { Evento, CategoriaEvento, HeroEventos, CreateEventoDto } from '../../models/api.models';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

const COLORES_CAT: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  green:  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  cyan:   'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  red:    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  pink:   'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
};

type VistaAdmin = 'eventos' | 'categorias' | 'hero';

@Component({
  selector: 'app-eventos',
  imports: [NgClass, FormsModule, ImageUrlInputComponent],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos implements OnInit, OnDestroy {

  vistaActiva: VistaAdmin = 'eventos';

  eventos:    Evento[]          = [];
  categorias: CategoriaEvento[] = [];
  hero:       HeroEventos       = { etiqueta: '', titulo: '', subtitulo: '', imagenFondo: '' };

  coloresCat = COLORES_CAT;
  readonly coloresDisponibles = Object.keys(COLORES_CAT);

  // ─── Filtros ──────────────────────────────────────────────────────────────
  filtroQ         = '';
  filtroCategoria = '';
  filtroMes       = 0;
  filtroAnio      = 0;

  get eventosFiltrados(): Evento[] {
    let lista = this.eventos;
    if (this.filtroQ)         lista = lista.filter(e => e.titulo.toLowerCase().includes(this.filtroQ.toLowerCase()));
    if (this.filtroCategoria) lista = lista.filter(e => e.categoria === this.filtroCategoria);
    if (this.filtroMes)       lista = lista.filter(e => new Date(e.fecha).getMonth() + 1 === this.filtroMes);
    if (this.filtroAnio)      lista = lista.filter(e => new Date(e.fecha).getFullYear() === this.filtroAnio);
    return lista;
  }

  readonly meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  readonly anios = [2024, 2025, 2026, 2027];

  // ─── Modal evento ─────────────────────────────────────────────────────────
  modalEvento = false;
  /** _id del evento que se edita. null = modo creación. */
  editandoId: string | null = null;
  form: Partial<Evento> = {};

  // ─── Modal categoría ──────────────────────────────────────────────────────
  modalCategoria    = false;
  editandoCatId: number | null = null;
  formCat: Partial<CategoriaEvento> = {};

  // ─── Confirmación eliminar ────────────────────────────────────────────────
  confirmarEliminar     = false;
  eventoEliminar: Evento | null = null;

  confirmarEliminarCat     = false;
  catEliminar: CategoriaEvento | null = null;

  // ─── Menú contextual — usa _id (string) ──────────────────────────────────
  menuAbierto: string | null = null;

  private subs = new Subscription();

  constructor(
    private eventoService:   EventoService,
    private activityService: ActivityService,
    public  router:          Router,
  ) {}

  ngOnInit(): void {
    this.subs.add(this.eventoService.eventos$.subscribe(e    => this.eventos    = e));
    this.subs.add(this.eventoService.categorias$.subscribe(c => this.categorias = c));
    this.subs.add(this.eventoService.hero$.subscribe(h       => this.hero       = { ...h }));
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ─── Navegación — usa _id ─────────────────────────────────────────────────

  irEditor(ev: Evento): void {
    this.router.navigate(['/eventos', ev._id], { state: { titulo: ev.titulo } });
  }

  // ─── Modal evento ─────────────────────────────────────────────────────────

  abrirModalNuevo(): void {
    this.editandoId = null;
    this.form = {
      titulo: '', descripcionCorta: '', descripcionCompleta: '',
      categoria: '', categoriaColor: 'blue',
      fecha: '', horaInicio: '', horaFin: '',
      ubicacion: '', imagenPrincipal: '',
      publicado: false, destacado: false,
      galeria: [], agenda: [],
      registro: { habilitado: false, labelBoton: 'Registrarse', url: '' },
    };
    this.modalEvento = true;
  }

  abrirModalEditar(ev: Evento): void {
    this.editandoId  = ev._id;   // ← _id string
    this.form        = JSON.parse(JSON.stringify(ev));
    this.modalEvento = true;
    this.menuAbierto = null;
  }

  cerrarModalEvento(): void { this.modalEvento = false; }

  guardarEvento(): void {
    const { titulo, descripcionCorta, categoria, fecha, ubicacion } = this.form;
    if (!titulo || !descripcionCorta || !categoria || !fecha || !ubicacion) return;

    const cat = this.categorias.find(c => c.nombre === categoria);
    if (cat) this.form.categoriaColor = cat.color;

    if (this.editandoId !== null) {
      // Actualización — el objeto ya tiene _id
      this.eventoService.actualizar(this.form as Evento).subscribe(() => {
        this.activityService.agregarActividad('evento', 'Evento actualizado', `Se editó "${titulo}".`);
      });
    } else {
      // Creación
      const dto: CreateEventoDto = {
        ...(this.form as CreateEventoDto),
        slug: this.eventoService.generarSlug(titulo!),
      };
      this.eventoService.agregar(dto).subscribe(() => {
        this.activityService.agregarActividad('evento', 'Evento creado', `Se creó "${titulo}".`);
      });
    }
    this.cerrarModalEvento();
  }

  // ─── Acciones rápidas — usan _id ─────────────────────────────────────────

  togglePublicado(ev: Evento, e: Event): void {
    e.stopPropagation();
    this.eventoService.togglePublicado(ev._id).subscribe();
  }

  setDestacado(ev: Evento, e: Event): void {
    e.stopPropagation();
    this.eventoService.setDestacado(ev._id).subscribe(() => {
      this.activityService.agregarActividad('evento', 'Evento destacado', `"${ev.titulo}" marcado como destacado.`);
    });
    this.menuAbierto = null;
  }

  // ─── Eliminar evento ──────────────────────────────────────────────────────

  pedirEliminar(ev: Evento): void {
    this.eventoEliminar    = ev;
    this.confirmarEliminar = true;
    this.menuAbierto       = null;
  }

  confirmarEliminarEvento(): void {
    if (!this.eventoEliminar) return;
    this.eventoService.eliminar(this.eventoEliminar._id).subscribe(() => {
      this.activityService.agregarActividad('evento', 'Evento eliminado', `Se eliminó "${this.eventoEliminar!.titulo}".`);
    });
    this.eventoEliminar    = null;
    this.confirmarEliminar = false;
  }

  cancelarEliminar(): void { this.confirmarEliminar = false; this.eventoEliminar = null; }

  // ─── Categorías ───────────────────────────────────────────────────────────

  abrirModalCat(cat?: CategoriaEvento): void {
    this.editandoCatId  = cat?.id ?? null;
    this.formCat        = cat ? { ...cat } : { nombre: '', color: 'blue' };
    this.modalCategoria = true;
  }

  cerrarModalCat(): void { this.modalCategoria = false; }

  guardarCategoria(): void {
    if (!this.formCat.nombre) return;
    if (this.editandoCatId !== null) {
      this.eventoService.actualizarCategoria(this.formCat as CategoriaEvento);
    } else {
      this.eventoService.agregarCategoria(this.formCat as Omit<CategoriaEvento, 'id'>);
    }
    this.cerrarModalCat();
  }

  pedirEliminarCat(cat: CategoriaEvento): void { this.catEliminar = cat; this.confirmarEliminarCat = true; }

  confirmarEliminarCategoria(): void {
    if (!this.catEliminar) return;
    this.eventoService.eliminarCategoria(this.catEliminar.id);
    this.catEliminar = null; this.confirmarEliminarCat = false;
  }

  cancelarEliminarCat(): void { this.confirmarEliminarCat = false; this.catEliminar = null; }

  // ─── Hero ─────────────────────────────────────────────────────────────────

  guardarHero(): void {
    this.eventoService.actualizarHero(this.hero);
    this.activityService.agregarActividad('evento', 'Hero actualizado', 'Se actualizó la configuración del hero de eventos.');
  }

  // ─── Menú contextual — usa _id (string) ──────────────────────────────────

  toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  @HostListener('document:click')
  cerrarMenu(): void { this.menuAbierto = null; }

  @HostListener('document:keydown.escape')
  cerrarEscape(): void {
    this.menuAbierto           = null;
    this.confirmarEliminar     = false;
    this.confirmarEliminarCat  = false;
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  formatFecha(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  contarEventosPorCategoria(nombre: string): number {
    return this.eventos.filter(e => e.categoria === nombre).length;
  }

  getCatColor(nombre: string): string {
    const cat = this.categorias.find(c => c.nombre === nombre);
    return this.coloresCat[cat?.color ?? 'blue'] ?? this.coloresCat['blue'];
  }
}
