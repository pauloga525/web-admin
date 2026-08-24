import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasApiService } from '../../services/noticias.service';
import { Noticia, CreateNoticiaDto } from '../../models/api.models';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-7xl mx-auto w-full space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Noticias</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestiona todas las noticias del sitio público.</p>
    </div>
    <div class="flex items-center gap-3">
      <button type="button" (click)="nuevaNoticia()" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Nueva noticia
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

    <!-- LISTA -->
    <div class="lg:col-span-2 space-y-2">
      <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Noticias ({{noticias.length}})</p>
      @for (n of noticias; track n._id) {
      <div class="group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
           [ngClass]="seleccionada?._id === n._id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark'"
           (click)="seleccionar(n)">
        <div class="w-12 h-12 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          @if (n.image || n.featuredImage) { <img [src]="n.image || n.featuredImage" [alt]="n.title" class="w-full h-full object-cover" /> }
          @else { <div class="w-full h-full flex items-center justify-center text-slate-300"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div> }
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-primary truncate">{{n.tag || n.category || 'Sin categoría'}}</p>
          <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{n.title || 'Sin título'}}</p>
          <p class="text-[11px] text-slate-400 truncate">{{n.date || 'Sin fecha'}}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          @if (n.destacada) { <span class="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">★</span> }
          <button type="button" (click)="eliminar(n._id); $event.stopPropagation()" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition p-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
      }
      @if (!noticias.length) { <p class="text-sm text-slate-400 italic text-center py-8">Sin noticias — crea una arriba.</p> }
    </div>

    <!-- EDITOR -->
    <div class="lg:col-span-3">
      @if (!seleccionada) {
        <div class="h-full flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl">
          <svg class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          <p class="text-sm text-slate-500 dark:text-slate-400">Selecciona una noticia para editarla.</p>
        </div>
      } @else {
      <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p class="text-sm font-bold text-slate-800 dark:text-white truncate max-w-xs">{{seleccionada.title || 'Nueva noticia'}}</p>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer shrink-0">
              <input type="checkbox" [(ngModel)]="seleccionada.destacada" class="rounded" />
              <span class="text-xs text-slate-500">Destacada</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer shrink-0">
              <input type="checkbox" [(ngModel)]="seleccionada.publicada" class="rounded" />
              <span class="text-xs text-slate-500">Publicada</span>
            </label>
            <button type="button" (click)="guardar()"
              [class]="guardado ? 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
              @if (guardado) { <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
              } @else { <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar }
            </button>
          </div>
        </div>
        <div class="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <button type="button" (click)="tab = 'info'"      [class]="tab==='info'      ? 'px-4 py-2.5 text-xs font-bold border-b-2 border-primary text-primary' : 'px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 transition'">Información</button>
          <button type="button" (click)="tab = 'contenido'" [class]="tab==='contenido' ? 'px-4 py-2.5 text-xs font-bold border-b-2 border-primary text-primary' : 'px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 transition'">Contenido</button>
          <button type="button" (click)="tab = 'galeria'"   [class]="tab==='galeria'   ? 'px-4 py-2.5 text-xs font-bold border-b-2 border-primary text-primary' : 'px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 transition'">Galería & Tags</button>
        </div>
        <div class="p-5 space-y-4">

          @if (tab === 'info') {
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tag (listado)</label><input [(ngModel)]="seleccionada.tag" class="input-field" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría (detalle)</label><input [(ngModel)]="seleccionada.category" class="input-field" /></div>
              <div class="col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label><input [(ngModel)]="seleccionada.title" class="input-field font-semibold" /></div>
              <div class="col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción corta</label><textarea [(ngModel)]="seleccionada.description" rows="2" class="input-field resize-none"></textarea></div>
              <div><app-image-url-input label="Imagen tarjeta" [(ngModel)]="seleccionada.image" placeholder="https://..." previewHeight="h-28" /></div>
              <div><app-image-url-input label="Imagen hero" [(ngModel)]="seleccionada.featuredImage" placeholder="https://..." previewHeight="h-28" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Autor</label><input [(ngModel)]="seleccionada.author" class="input-field" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha</label><input [(ngModel)]="seleccionada.date" placeholder="Ej: 15 Ene 2025" class="input-field" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tiempo de lectura</label><input [(ngModel)]="seleccionada.readTime" placeholder="Ej: 3 min" class="input-field" /></div>
            </div>
          </div>
          }

          @if (tab === 'contenido') {
          <div class="space-y-3">
            <p class="text-xs text-slate-400">Escribe el artículo completo. Separa los párrafos con una línea en blanco.</p>
            <textarea [(ngModel)]="seleccionada.content" rows="18" class="input-field resize-y font-mono text-sm leading-relaxed"></textarea>
          </div>
          }

          @if (tab === 'galeria') {
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Galería de imágenes</p>
                <button type="button" (click)="agregarImagen()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
              </div>
              <div class="space-y-2">
                @for (img of seleccionada.images; track img.id) {
                <div class="flex items-center gap-2">
                  <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="img.url" placeholder="URL imagen" [showPreview]="false" />
                  <input [(ngModel)]="img.alt" placeholder="Descripción" class="flex-1 input-field text-xs" />
                  <button type="button" (click)="eliminarImagen(img.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                }
                @if (!seleccionada.images.length) { <p class="text-xs text-slate-400 italic">Sin imágenes en la galería.</p> }
              </div>
            </div>
            <hr class="border-slate-100 dark:border-slate-800" />
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Tags</p>
              <div class="flex flex-wrap gap-2 mb-3">
                @for (tag of seleccionada.tags; track tag) {
                <span class="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs">
                  {{tag}}
                  <button type="button" (click)="eliminarTag(tag)" class="text-slate-400 hover:text-red-500 transition"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </span>
                }
              </div>
              <div class="flex gap-2">
                <input [(ngModel)]="nuevoTag" (keyup.enter)="agregarTag()" placeholder="Nuevo tag..." class="flex-1 input-field text-sm" />
                <button type="button" (click)="agregarTag()" class="px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shrink-0">Agregar</button>
              </div>
            </div>
          </div>
          }

        </div>
      </div>
      }
    </div>
  </div>
</div>
  `,
})
export class Noticias implements OnInit {

  noticias: Noticia[] = [];
  seleccionada: Noticia | null = null;
  guardado = false;
  tab: 'info' | 'contenido' | 'galeria' = 'info';
  nuevoTag = '';
  esNueva = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: NoticiasApiService) {}

  ngOnInit(): void {
    this.svc.noticias$.subscribe(lista => { this.noticias = lista; });
  }

  seleccionar(n: Noticia): void {
    this.seleccionada = JSON.parse(JSON.stringify(n));
    this.esNueva = false;
    this.tab = 'info';
    this.guardado = false;
  }

  nuevaNoticia(): void {
    this.seleccionada = {
      _id: '', createdAt: '', updatedAt: '',
      tag: '', title: '', description: '', image: '', destacada: false,
      category: '', featuredImage: '', author: 'Redacción UETS', authorImage: '',
      date: '', readTime: '3 min', content: '', images: [], tags: [], publicada: true,
    };
    this.esNueva = true;
    this.tab = 'info';
    this.guardado = false;
  }

  guardar(): void {
    if (!this.seleccionada) return;
    const { _id, createdAt, updatedAt, ...dto } = this.seleccionada;

    if (this.esNueva) {
      this.svc.crear(dto as CreateNoticiaDto).subscribe({
        next: () => {
          this.esNueva = false;
          this.seleccionada = null;
          this.mostrarGuardado();
        },
        error: err => console.error('Error al crear noticia:', err),
      });
    } else {
      this.svc.actualizar(_id, dto).subscribe({
        next: () => this.mostrarGuardado(),
        error: err => console.error('Error al actualizar noticia:', err),
      });
    }
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar esta noticia?')) return;
    this.svc.eliminar(id).subscribe({
      next: () => { if (this.seleccionada?._id === id) this.seleccionada = null; },
      error: err => console.error('Error al eliminar noticia:', err),
    });
  }

  private mostrarGuardado(): void {
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  agregarTag(): void {
    const t = this.nuevoTag.trim();
    if (!t || !this.seleccionada) return;
    if (!this.seleccionada.tags.includes(t)) this.seleccionada.tags.push(t);
    this.nuevoTag = '';
  }

  eliminarTag(tag: string): void {
    if (!this.seleccionada) return;
    this.seleccionada.tags = this.seleccionada.tags.filter(t => t !== tag);
  }

  agregarImagen(): void {
    this.seleccionada?.images.push({ id: Date.now(), url: '', alt: '' });
  }

  eliminarImagen(id: number): void {
    if (!this.seleccionada) return;
    this.seleccionada.images = this.seleccionada.images.filter(i => i.id !== id);
  }
}
