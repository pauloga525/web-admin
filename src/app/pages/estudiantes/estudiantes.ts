import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesPageService, EstudiantesPageConfig, GaleriaImagen, Club, Promocion, Instalacion } from '../../services/estudiantes-page.service';
import { LogrosApiService, LogroApi } from '../../services/logros-api.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import { PromocioneManagerComponent } from '../../components/promociones-manager/promociones-manager.component';
import { IconPickerComponent } from '../../components/icon-picker/icon-picker.component';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Tab = 'hero' | 'galeria' | 'clubes' | 'promociones' | 'logros' | 'instalaciones' | 'graduados';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent, PromocioneManagerComponent, IconPickerComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Alumnos</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de vida estudiantil.</p>
    </div>
    <button type="button" (click)="guardarTodo()" [disabled]="guardando" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20 disabled:opacity-60'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {{ guardando ? 'Guardando...' : 'Guardar cambios' }} }
    </button>
  </div>
  <p class="text-xs text-slate-500 dark:text-slate-400 -mt-4">Este botón guarda todas las pestañas de una vez, incluidos los logros con sus imágenes.</p>

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
              <app-icon-picker class="w-36 shrink-0" [(ngModel)]="c.icon" (ngModelChange)="onChange()" />
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
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Logros ({{logros.length}})</h3>
          <button type="button" (click)="agregarLogro()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500">Estos logros son la fuente real de la página pública "Logros Estudiantiles" — marca "Destacado" para que aparezcan también aquí, en el teaser de Alumnos.</p>
        @if (errorLogro) { <p class="text-xs text-red-500">{{errorLogro}}</p> }
        <div class="space-y-3">
          @for (l of logros; track $index) {
          <div class="border rounded-xl overflow-hidden" [class]="!l.title.trim() ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700'">

            <!-- Encabezado — el título siempre es editable aquí mismo, sin expandir -->
            <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
              <button type="button" (click)="toggleLogro($index)" class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="expandidoLogro === $index"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <input [(ngModel)]="l.title" placeholder="Título del logro"
                class="flex-1 min-w-0 bg-transparent border-0 border-b-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 px-1 py-0.5"
                [class]="!l.title.trim() ? 'border-amber-400 placeholder:text-amber-500' : 'border-transparent focus:border-primary'" />
              @if (!l._id) { <span class="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">Nuevo</span> }
              <button type="button" (click)="eliminarLogro($index)" class="text-slate-300 hover:text-red-500 transition shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            @if (!l.title.trim()) {
              <p class="text-[11px] text-amber-600 dark:text-amber-400 px-4 -mt-1 pb-2 bg-slate-50 dark:bg-slate-800/50">Sin título — no se guardará hasta que le pongas uno.</p>
            }

            <!-- Contenido expandible -->
            @if (expandidoLogro === $index) {
            <div class="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800 animate-[fadeIn_.15s_ease_forwards]">
              <div class="flex items-center gap-2">
                <input [(ngModel)]="l.badge" placeholder="Badge (ej: 1er Lugar)" class="w-32 input-field text-xs font-bold text-primary" />
                <input [(ngModel)]="l.date" placeholder="Fecha" class="flex-1 input-field text-xs" />
              </div>
              <textarea [(ngModel)]="l.description" rows="2" placeholder="Descripción" class="w-full input-field resize-none text-sm"></textarea>
              <app-image-url-input label="Imagen del logro" [(ngModel)]="l.image" placeholder="https://..." previewHeight="h-32" />
              <div class="flex items-center gap-3 flex-wrap">
                <input [(ngModel)]="l.category" placeholder="Categoría" class="w-40 input-field text-xs" />
                <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input type="checkbox" [(ngModel)]="l.featured" class="rounded" />
                  <span class="text-xs text-slate-500">Destacado</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input type="checkbox" [(ngModel)]="l.publicado" class="rounded" />
                  <span class="text-xs text-slate-500">Publicado</span>
                </label>
              </div>
              <div class="flex items-center justify-end gap-3">
                <span class="text-[11px] text-slate-400">o usa "Guardar cambios" arriba para guardar todo junto</span>
                <button type="button" (click)="guardarLogro($index)" class="text-xs font-semibold text-primary hover:underline shrink-0">
                  {{ l._id ? 'Guardar solo este' : 'Crear solo este' }}
                </button>
              </div>
            </div>
            }
          </div>
          }
          @if (!logros.length) {
            <p class="text-sm text-slate-400 italic text-center py-8">Sin logros — agrega uno arriba.</p>
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

      <!-- ══ GRADUADOS (/gallery) ══ -->
      @if (tabActiva === 'graduados') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero — Página "Nuestros Graduados"</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 -mt-2">Cabecera y banner destacado de la página pública /gallery.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
            <input [(ngModel)]="config.graduadosHeroTitulo" (ngModelChange)="onChange()" class="input-field font-semibold" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <textarea [(ngModel)]="config.graduadosHeroDescripcion" (ngModelChange)="onChange()" rows="2" class="input-field resize-none"></textarea></div>
        </div>

        <hr class="border-slate-100 dark:border-slate-800" />

        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Banner destacado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-image-url-input class="md:col-span-2" label="Imagen de fondo" [(ngModel)]="config.graduadosDestacadoImagen" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-40" />
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Etiqueta (badge)</label>
            <input [(ngModel)]="config.graduadosDestacadoBadge" (ngModelChange)="onChange()" placeholder="Ej: Destacado" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
            <input [(ngModel)]="config.graduadosDestacadoTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <textarea [(ngModel)]="config.graduadosDestacadoDescripcion" (ngModelChange)="onChange()" rows="2" class="input-field resize-none"></textarea></div>
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
  logros: LogroApi[] = [];
  expandidoLogro: number | null = null;
  errorLogro = '';
  tabActiva: Tab = 'hero';
  guardado = false;
  guardando = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sub?: Subscription;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',          label: 'Hero'          },
    { id: 'galeria',       label: 'Galería'       },
    { id: 'clubes',        label: 'Clubes'        },
    { id: 'promociones',   label: 'Promociones'   },
    { id: 'logros',        label: 'Logros'        },
    { id: 'instalaciones', label: 'Instalaciones' },
    { id: 'graduados',     label: 'Graduados'     },
  ];

  constructor(
    private svc: EstudiantesPageService,
    private logrosApi: LogrosApiService,
  ) {
    this.config = this.svc.getCopia();
  }
  ngOnInit(): void {
    this.sub = this.svc.config$.subscribe(config => {
      this.config = JSON.parse(JSON.stringify(config));
    });
    this.cargarLogros();
  }

  private cargarLogros(): void {
    this.logrosApi.list().subscribe(list => this.logros = list);
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

  /**
   * Guarda TODO de una vez: la configuración de página (hero, galería, clubes,
   * promociones, instalaciones, graduados) Y cada logro de la lista (con su
   * imagen). Antes el botón principal solo guardaba la configuración — si el
   * usuario subía una foto a un logro y usaba solo este botón, la foto nunca
   * se enviaba al backend y se perdía al recargar la página.
   */
  guardarTodo(): void {
    this.errorLogro = '';
    this.guardando = true;

    const logrosConTitulo = this.logros.filter(l => l.title.trim().length > 0);
    const logrosSinTitulo = this.logros.length - logrosConTitulo.length;

    const config$ = this.svc.guardar(this.config).pipe(catchError(() => of(null)));
    const logros$ = logrosConTitulo.map(l => {
      const dto = { badge: l.badge, badgeClass: l.badgeClass, date: l.date, title: l.title, category: l.category, description: l.description, image: l.image, featured: l.featured, publicado: l.publicado };
      const req = l._id ? this.logrosApi.update(l._id, dto) : this.logrosApi.create(dto);
      return req.pipe(catchError(() => of(null)));
    });

    forkJoin([config$, ...logros$]).subscribe(results => {
      this.guardando = false;
      const fallos = results.slice(1).filter(r => r === null).length;

      if (fallos > 0) {
        this.errorLogro = `${fallos} logro(s) no se pudieron guardar. Revisa tu conexión e inténtalo de nuevo.`;
      } else if (logrosSinTitulo > 0) {
        this.errorLogro = `${logrosSinTitulo} logro(s) sin título no se guardaron (el título es obligatorio).`;
      }

      this.cargarLogros();
      this.guardado = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.guardado = false, 3000);
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

  toggleLogro(index: number): void {
    this.expandidoLogro = this.expandidoLogro === index ? null : index;
  }

  agregarLogro(): void {
    this.logros.push({
      _id: '', badge: '', badgeClass: '', date: '', title: '', category: '',
      description: '', image: '', featured: false, publicado: true,
      createdAt: '', updatedAt: '',
    });
    this.expandidoLogro = this.logros.length - 1;
  }

  guardarLogro(index: number): void {
    this.errorLogro = '';
    const l = this.logros[index];
    if (!l.title) { this.errorLogro = 'El título es obligatorio.'; return; }
    const dto = { badge: l.badge, badgeClass: l.badgeClass, date: l.date, title: l.title, category: l.category, description: l.description, image: l.image, featured: l.featured, publicado: l.publicado };
    const req = l._id ? this.logrosApi.update(l._id, dto) : this.logrosApi.create(dto);
    req.subscribe({
      next: () => this.cargarLogros(),
      error: () => { this.errorLogro = 'No se pudo guardar el logro.'; },
    });
  }

  eliminarLogro(index: number): void {
    const l = this.logros[index];
    if (this.expandidoLogro === index) this.expandidoLogro = null;
    if (!l._id) { this.logros.splice(index, 1); return; }
    this.logrosApi.delete(l._id).subscribe({
      next: () => this.cargarLogros(),
    });
  }

  agregarInstalacion(): void { this.config.instalaciones.push({ id: this.svc.nextId(), title: '', description: '', image: '' }); this.onChange(); }
  eliminarInstalacion(id: number): void { this.config.instalaciones = this.config.instalaciones.filter(i => i.id !== id); this.onChange(); }
}
