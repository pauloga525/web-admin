import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniformesService, UniformesConfig, Uniforme, UniformeImagen } from '../../services/uniformes.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

type Tab = 'hero' | 'uniformes';

@Component({
  selector: 'app-uniformes',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Uniformes</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de Uniformes Escolares.</p>
    </div>
    <button type="button" (click)="guardar()" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios }
    </button>
  </div>

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <!-- TABS -->
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id" [class]="tabActiva === t.id ? 'px-5 py-3 text-xs font-bold border-b-2 border-primary text-primary' : 'px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition'">{{t.label}}</button>
        }
      </div>
    </div>

    <div class="p-6">

      <!-- ══ HERO ══ -->
      @if (tabActiva === 'hero') {
      <div class="space-y-5 animate-[fadeIn_.2s_ease_forwards]">

        <!-- Hero principal -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero</h3>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
            <input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <textarea [(ngModel)]="config.heroDescripcion" (ngModelChange)="onChange()" rows="2" class="input-field resize-none"></textarea></div>
          <app-image-url-input label="Imagen de fondo" [(ngModel)]="config.heroImagen" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-40" />
        </div>

        <hr class="border-slate-100 dark:border-slate-800" />

        <!-- Tarjetas de estadísticas -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tarjetas de información</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Card 1 (auto: muestra uniforms.length) -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 bg-slate-50 dark:bg-slate-800/30">
              <p class="text-[10px] font-bold uppercase text-slate-400">Tarjeta 1 — valor automático</p>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
                <input [(ngModel)]="config.card1Titulo" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
                <input [(ngModel)]="config.card1Desc" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
            </div>
            <!-- Card 2 (auto: muestra categories.length) -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 bg-slate-50 dark:bg-slate-800/30">
              <p class="text-[10px] font-bold uppercase text-slate-400">Tarjeta 2 — valor automático</p>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
                <input [(ngModel)]="config.card2Titulo" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
                <input [(ngModel)]="config.card2Desc" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
            </div>
            <!-- Card 3 (valor manual) -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 bg-slate-50 dark:bg-slate-800/30">
              <p class="text-[10px] font-bold uppercase text-slate-400">Tarjeta 3 — valor editable</p>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Valor</label>
                <input [(ngModel)]="config.card3Valor" (ngModelChange)="onChange()" placeholder="100%" class="input-field text-sm font-bold text-primary" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
                <input [(ngModel)]="config.card3Titulo" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
                <input [(ngModel)]="config.card3Desc" (ngModelChange)="onChange()" class="input-field text-sm" /></div>
            </div>
          </div>
        </div>

      </div>
      }

      <!-- ══ UNIFORMES ══ -->
      @if (tabActiva === 'uniformes') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Uniformes ({{config.uniformes.length}})</h3>
          <button type="button" (click)="agregarUniforme()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar uniforme
          </button>
        </div>

        <div class="space-y-6">
          @for (u of config.uniformes; track trackById($index, u)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">

            <!-- Header del uniforme -->
            <div class="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <button type="button" (click)="toggleUniforme(u.id)"
                  class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="expandido === u.id"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                  {{u.name || 'Sin nombre'}}
                </button>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{u.category}}</span>
              </div>
              <button type="button" (click)="eliminarUniforme(u.id)" class="text-slate-300 hover:text-red-500 transition">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>

            <!-- Contenido expandible -->
            @if (expandido === u.id) {
            <div class="p-5 space-y-5 animate-[fadeIn_.15s_ease_forwards]">

              <!-- Datos generales -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
                  <input [(ngModel)]="u.name" (ngModelChange)="onChange()" class="input-field font-semibold" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                  <input [(ngModel)]="u.category" (ngModelChange)="onChange()" placeholder="Ej: Diario, Deportivo" class="input-field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Precio aproximado</label>
                  <input [(ngModel)]="u.price" (ngModelChange)="onChange()" placeholder="Ej: $45.00" class="input-field" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disponibilidad</label>
                  <select [(ngModel)]="u.availability" (ngModelChange)="onChange()"
                    class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="En stock">En stock</option>
                    <option value="Bajo pedido">Bajo pedido</option>
                    <option value="Agotado">Agotado</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
                  <textarea [(ngModel)]="u.description" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea>
                </div>
              </div>

              <hr class="border-slate-100 dark:border-slate-800" />

              <!-- Galería de imágenes (CRUD) -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Galería de imágenes ({{u.images.length}})
                  </h4>
                  <button type="button" (click)="agregarImagen(u)" class="text-xs text-primary hover:underline flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar imagen
                  </button>
                </div>

                @if (!u.images.length) {
                  <p class="text-xs text-slate-400 italic py-3 text-center">Sin imágenes — agrega una arriba.</p>
                }

                <div class="space-y-2">
                  @for (img of u.images; track trackById($index, img)) {
                  <div class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <!-- Preview -->
                    <div class="w-16 h-14 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      @if (img.url) {
                        <img [src]="img.url" [alt]="img.alt" class="w-full h-full object-cover" />
                      } @else {
                        <svg class="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      }
                    </div>
                    <!-- Campos -->
                    <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                      <app-image-url-input class="min-w-0" [(ngModel)]="img.url" (ngModelChange)="onChange()" placeholder="URL de la imagen" [showPreview]="false" />
                      <input [(ngModel)]="img.alt" (ngModelChange)="onChange()" placeholder="Descripción (ej: Vista frontal)" class="input-field text-xs" />
                    </div>
                    <!-- Eliminar -->
                    <button type="button" (click)="eliminarImagen(u, img.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  }
                </div>
              </div>

            </div>
            }

          </div>
          }

          @if (!config.uniformes.length) {
            <p class="text-sm text-slate-400 italic text-center py-10">Sin uniformes — agrega uno arriba.</p>
          }
        </div>
      </div>
      }

    </div>
  </div>
</div>
  `,
})
export class Uniformes implements OnInit {

  config!: UniformesConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  expandido: number | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',      label: 'Hero & Tarjetas' },
    { id: 'uniformes', label: 'Uniformes'       },
  ];

  constructor(private svc: UniformesService) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    // Expandir el primero por defecto
    if (this.config.uniformes.length) this.expandido = this.config.uniformes[0].id;
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config);
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  toggleUniforme(id: number): void {
    this.expandido = this.expandido === id ? null : id;
  }

  // ── Uniformes ──────────────────────────────────────────────────────────────
  agregarUniforme(): void {
    const nuevo: Uniforme = {
      id: this.svc.nextId(), name: '', category: '', description: '',
      price: '', availability: 'En stock', images: [],
    };
    this.config.uniformes.push(nuevo);
    this.expandido = nuevo.id;
    this.onChange();
  }

  eliminarUniforme(id: number): void {
    this.config.uniformes = this.config.uniformes.filter(u => u.id !== id);
    if (this.expandido === id) this.expandido = this.config.uniformes[0]?.id ?? null;
    this.onChange();
  }

  // ── Imágenes ───────────────────────────────────────────────────────────────
  agregarImagen(u: Uniforme): void {
    u.images.push({ id: this.svc.nextId(), url: '', alt: '' });
    this.onChange();
  }

  eliminarImagen(u: Uniforme, imgId: number): void {
    u.images = u.images.filter(i => i.id !== imgId);
    this.onChange();
  }
}
