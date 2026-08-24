import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesPageService, EstudiantesPageConfig, GaleriaImagen, Club, Promocion, Logro, Instalacion } from '../../services/estudiantes-page.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import { PromocioneManagerComponent } from '../../components/promociones-manager/promociones-manager.component';
import { Subscription } from 'rxjs';

type Tab = 'hero' | 'galeria' | 'clubes' | 'promociones' | 'logros' | 'instalaciones';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent, PromocioneManagerComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Alumnos</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de vida estudiantil.</p>
    </div>
    <button type="button" (click)="guardar()" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios }
    </button>
  </div>

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <!-- TABS -->
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      <div class="flex min-w-max">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id" [class]="tabActiva === t.id ? 'px-4 py-3 text-xs font-bold border-b-2 border-primary text-primary whitespace-nowrap' : 'px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition whitespace-nowrap'">{{t.label}}</button>
        }
      </div>
    </div>

    <div class="p-6">

      <!-- ══ HERO ══ -->
      @if (tabActiva === 'hero') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-image-url-input class="md:col-span-2" label="Imagen de fondo" [(ngModel)]="config.heroImagen" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-40" />
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
            <input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChange()" class="input-field font-semibold" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <textarea [(ngModel)]="config.heroDescripcion" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Botón 1 — texto</label>
            <input [(ngModel)]="config.heroBoton1Label" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Botón 1 — URL</label>
            <input [(ngModel)]="config.heroBoton1Url" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Botón 2 — texto</label>
            <input [(ngModel)]="config.heroBoton2Label" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Botón 2 — URL</label>
            <input [(ngModel)]="config.heroBoton2Url" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
        </div>
      </div>
      }

      <!-- ══ GALERÍA ══ -->
      @if (tabActiva === 'galeria') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label>
            <input [(ngModel)]="config.galeriaTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver Galería Completa"</label>
            <input [(ngModel)]="config.galeriaUrl" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Imágenes</h3>
          <button type="button" (click)="agregarGaleria()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="space-y-3">
          @for (img of config.galeria; track trackById($index, img)) {
          <div class="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <div class="w-16 h-12 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              @if (img.url) { <img [src]="img.url" [alt]="img.alt" class="w-full h-full object-cover" /> }
            </div>
            <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="img.url" (ngModelChange)="onChange()" placeholder="URL imagen" [showPreview]="false" />
            <input [(ngModel)]="img.caption" (ngModelChange)="onChange()" placeholder="Leyenda" class="flex-1 input-field text-xs" />
            <button type="button" (click)="eliminarGaleria(img.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
          </div>
          }
        </div>
      </div>
      }

      <!-- ══ CLUBES ══ -->
      @if (tabActiva === 'clubes') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label>
            <input [(ngModel)]="config.clubesTitulo" (ngModelChange)="onChange()" class="input-field w-80" />
          </div>
          <button type="button" (click)="agregarClub()" class="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (c of config.clubes; track trackById($index, c)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div class="flex items-center gap-2">
              <input [(ngModel)]="c.icon" (ngModelChange)="onChange()" placeholder="Ícono material" class="w-32 input-field text-xs" />
              <input [(ngModel)]="c.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
              <button type="button" (click)="eliminarClub(c.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <textarea [(ngModel)]="c.description" (ngModelChange)="onChange()" rows="2" placeholder="Descripción" class="w-full input-field resize-none text-sm"></textarea>
          </div>
          }
        </div>
      </div>
      }

      <!-- ══ PROMOCIONES ══ -->
      @if (tabActiva === 'promociones') {
      <div class="animate-[fadeIn_.2s_ease_forwards]">
        <app-promociones-manager
          [titulo]="config.promocionesTitulo"
          [descripcion]="config.promocionesDescripcion"
          [promociones]="config.promociones"
          (cambios)="onPromocionesCambios($event)">
        </app-promociones-manager>
      </div>
      }

      <!-- ══ LOGROS ══ -->
      @if (tabActiva === 'logros') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label>
            <input [(ngModel)]="config.logrosTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver todos"</label>
            <input [(ngModel)]="config.logrosUrl" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Logros</h3>
          <button type="button" (click)="agregarLogro()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="space-y-4">
          @for (l of config.logros; track trackById($index, l)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <input [(ngModel)]="l.badge" (ngModelChange)="onChange()" placeholder="Badge (ej: 1er Lugar)" class="w-32 input-field text-xs font-bold text-primary" />
              <input [(ngModel)]="l.date" (ngModelChange)="onChange()" placeholder="Fecha" class="w-28 input-field text-xs" />
              <input [(ngModel)]="l.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
              <button type="button" (click)="eliminarLogro(l.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
            <textarea [(ngModel)]="l.description" (ngModelChange)="onChange()" rows="2" placeholder="Descripción" class="w-full input-field resize-none text-sm"></textarea>
            <div class="flex items-center gap-3">
              <div class="w-16 h-12 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                @if (l.image) { <img [src]="l.image" [alt]="l.title" class="w-full h-full object-cover" /> }
              </div>
              <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="l.image" (ngModelChange)="onChange()" placeholder="URL imagen" [showPreview]="false" />
            </div>
          </div>
          }
        </div>
      </div>
      }

      <!-- ══ INSTALACIONES ══ -->
      @if (tabActiva === 'instalaciones') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label>
            <input [(ngModel)]="config.instalacionesTitulo" (ngModelChange)="onChange()" class="input-field w-80" />
          </div>
          <button type="button" (click)="agregarInstalacion()" class="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (inst of config.instalaciones; track trackById($index, inst)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div class="h-32 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              @if (inst.image) { <img [src]="inst.image" [alt]="inst.title" class="w-full h-full object-cover" /> }
              @else { <div class="w-full h-full flex items-center justify-center text-slate-300"><svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div> }
            </div>
            <div class="p-4 space-y-2">
              <div class="flex items-center gap-2">
                <input [(ngModel)]="inst.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
                <button type="button" (click)="eliminarInstalacion(inst.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <app-image-url-input [(ngModel)]="inst.image" (ngModelChange)="onChange()" placeholder="URL imagen" [showPreview]="false" />
              <textarea [(ngModel)]="inst.description" (ngModelChange)="onChange()" rows="2" placeholder="Descripción" class="w-full input-field resize-none text-sm"></textarea>
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
export class Estudiantes implements OnInit, OnDestroy {

  config: EstudiantesPageConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sub?: Subscription;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',          label: 'Hero'          },
    { id: 'galeria',       label: 'Galería'       },
    { id: 'clubes',        label: 'Clubes'        },
    { id: 'promociones',   label: 'Promociones'   },
    { id: 'logros',        label: 'Logros'        },
    { id: 'instalaciones', label: 'Instalaciones' },
  ];

  constructor(private svc: EstudiantesPageService) {
    this.config = this.svc.getCopia();
  }
  ngOnInit(): void {
    this.sub = this.svc.config$.subscribe(config => {
      this.config = JSON.parse(JSON.stringify(config));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe({
      next: () => {
        this.guardado = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.guardado = false, 3000);
      },
      error: err => console.error('[Estudiantes] Error al guardar:', err),
    });
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  agregarGaleria(): void    { this.config.galeria.push({ id: this.svc.nextId(), url: '', alt: '', caption: '' }); this.onChange(); }
  eliminarGaleria(id: number): void { this.config.galeria = this.config.galeria.filter(i => i.id !== id); this.onChange(); }

  agregarClub(): void       { this.config.clubes.push({ id: this.svc.nextId(), icon: 'star', title: '', description: '' }); this.onChange(); }
  eliminarClub(id: number): void    { this.config.clubes = this.config.clubes.filter(c => c.id !== id); this.onChange(); }

  onPromocionesCambios(cambios: { titulo: string; descripcion: string; promociones: Promocion[] }): void {
    this.config.promocionesTitulo = cambios.titulo;
    this.config.promocionesDescripcion = cambios.descripcion;
    this.config.promociones = cambios.promociones;
    this.onChange();
  }

  agregarLogro(): void      { this.config.logros.push({ id: this.svc.nextId(), badge: '', date: '', title: '', description: '', image: '' }); this.onChange(); }
  eliminarLogro(id: number): void   { this.config.logros = this.config.logros.filter(l => l.id !== id); this.onChange(); }

  agregarInstalacion(): void { this.config.instalaciones.push({ id: this.svc.nextId(), title: '', description: '', image: '' }); this.onChange(); }
  eliminarInstalacion(id: number): void { this.config.instalaciones = this.config.instalaciones.filter(i => i.id !== id); this.onChange(); }
}
