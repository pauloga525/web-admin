/**
 * @file evento-editor.ts
 * @description Editor completo de un evento institucional.
 * Tabs: General, Imágenes, Agenda, Registro, Publicación.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { EventoService } from '../../../services/evento.service';
import { ActivityService } from '../../../services/activity';
import { Evento, Tab, AgendaItem, CategoriaEvento } from '../../../models/api.models';
import { Subscription } from 'rxjs';
import { ImageUrlInputComponent } from '../../../components/image-url-input/image-url-input.component';

@Component({
  selector: 'app-evento-editor',
  standalone: true,
  templateUrl: './evento-editor.html',
  styleUrl: './evento-editor.css',
  imports: [FormsModule, CommonModule, ImageUrlInputComponent],
})
export class EventoEditor implements OnInit, OnDestroy {

  evento: Evento | undefined;
  breadcrumb = '';
  tabActiva  = 'general';
  guardado   = false;
  confirmarEliminar = false;

  categorias: CategoriaEvento[] = [];
  private subs = new Subscription();

  readonly tabs: Tab[] = [
    { id: 'general',    label: 'General'    },
    { id: 'imagenes',   label: 'Imágenes'   },
    { id: 'agenda',     label: 'Agenda'     },
    { id: 'registro',   label: 'Registro'   },
    { id: 'publicacion',label: 'Publicación'},
  ];

  constructor(
    private route:          ActivatedRoute,
    private location:       Location,
    private router:         Router,
    private eventoService:  EventoService,
    private activityService:ActivityService,
  ) {}

  ngOnInit(): void {
    this.breadcrumb = history.state?.titulo ?? '';
    this.subs.add(this.eventoService.categorias$.subscribe(categorias => {
      this.categorias = categorias;
    }));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // getById ahora devuelve Observable<Evento> y acepta string (_id de Mongo)
    this.eventoService.getById(id).subscribe({
      next: original => {
        this.evento = JSON.parse(JSON.stringify(original));
        this.inicializar();
      },
      error: () => this.router.navigate(['/eventos']),
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private inicializar(): void {
    if (!this.evento) return;
    this.evento.galeria  ??= [];
    this.evento.agenda   ??= [];
    this.evento.registro ??= { habilitado: false, labelBoton: 'Registrarse', url: '' };
  }

  // ─── Guardar / Eliminar ─────────────────────────────────────────────────────

  guardar(): void {
    if (!this.evento) return;
    // Sincronizar color de categoría
    const cat = this.categorias.find(c => c.nombre === this.evento!.categoria);
    if (cat) this.evento.categoriaColor = cat.color;
    // Regenerar slug si cambió el título
    this.evento.slug = this.eventoService.generarSlug(this.evento.titulo);

    this.eventoService.actualizar(this.evento).subscribe(() => {
      this.activityService.agregarActividad('evento', 'Evento actualizado', `Se guardaron los cambios de "${this.evento!.titulo}".`);
      this.guardado = true;
    });
  }

  pedirEliminar(): void    { this.confirmarEliminar = true; }
  cancelarEliminar(): void { this.confirmarEliminar = false; }

  confirmarEliminarEvento(): void {
    if (!this.evento) return;
    this.eventoService.eliminar(this.evento._id).subscribe(() => {
      this.activityService.agregarActividad('evento', 'Evento eliminado', `Se eliminó "${this.evento!.titulo}".`);
      this.router.navigate(['/eventos']);
    });
  }

  onCambio(): void { this.guardado = false; }
  volver(): void   { this.location.back(); }

  // ─── Galería ────────────────────────────────────────────────────────────────

  agregarImagen(): void {
    this.evento?.galeria?.push('');
    this.onCambio();
  }

  eliminarImagen(i: number): void {
    this.evento?.galeria?.splice(i, 1);
    this.onCambio();
  }

  actualizarImagenGaleria(index: number, url: string): void {
    if (!this.evento?.galeria) return;
    this.evento.galeria[index] = url;
    this.onCambio();
  }

  trackByIndex(i: number): number { return i; }

  // ─── Agenda ─────────────────────────────────────────────────────────────────

  agregarAgendaItem(): void {
    this.evento?.agenda?.push({ id: Date.now(), hora: '', titulo: '', descripcion: '' });
    this.onCambio();
  }

  eliminarAgendaItem(id: number): void {
    if (!this.evento) return;
    this.evento.agenda = this.evento.agenda!.filter(a => a.id !== id);
    this.onCambio();
  }
}
