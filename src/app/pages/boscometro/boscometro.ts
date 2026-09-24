import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecursosApiService, RecursoApi } from '../../services/recursos-api.service';
import { BoscometroPageService, BoscometroPageConfig } from '../../services/boscometro-page.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

const TIPO_TABLA = 'boscometro_tabla';
const TIPO_GRAFICO = 'boscometro_grafico';

/** Una sección agrupa la tabla y el gráfico que se importaron juntos (mismo seccionId). */
interface SeccionBoscometro {
  key: string;
  orden: number;
  tabla?: RecursoApi;
  grafico?: RecursoApi;
}

@Component({
  selector: 'app-boscometro',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Boscómetro</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de Boscómetro.</p>
    </div>
    <button type="button" (click)="guardarConfig()" [disabled]="guardandoConfig" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20 disabled:opacity-60'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {{ guardandoConfig ? 'Guardando...' : 'Guardar imagen de fondo' }} }
    </button>
  </div>

  <!-- IMAGEN DE FONDO -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
    <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Imagen de fondo del hero</h3>
    <app-image-url-input [(ngModel)]="config.heroImagen" (ngModelChange)="onChangeConfig()" placeholder="https://..." previewHeight="h-40" />
  </div>

  <!-- SECCIONES (TABLA + GRÁFICO) -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Secciones ({{secciones.length}})</h3>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400">Sube un Excel (.xlsx) con <strong>2 hojas</strong> o importa desde un enlace de Google Sheets/Drive con 2 hojas: la primera con la tabla de puntajes (las filas con color de fondo se resaltan como encabezado) y la segunda con 2 columnas (<strong>Curso</strong> y <strong>Total</strong>) para el gráfico. Ambos se crean juntos como una sola sección.</p>

    <!-- Form de importación -->
    <div class="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
          <input [(ngModel)]="nuevaSeccionTitulo" placeholder="Ej: Boscómetro Básica Elemental" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subtítulo del gráfico (opcional)</label>
          <input [(ngModel)]="nuevaSeccionSubtitulo" placeholder="Ej: Boscómetro Preparatoria - Elemental 2025 - 2026" class="input-field" />
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name="fuenteSeccion" value="archivo" [(ngModel)]="fuenteSeccion" /> Archivo Excel
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name="fuenteSeccion" value="google" [(ngModel)]="fuenteSeccion" /> Google Drive
        </label>
      </div>

      @if (fuenteSeccion === 'archivo') {
        <div class="flex items-center gap-2">
          <input #seccionFile type="file" accept=".xlsx,.xls" (change)="onSeccionFileSelected($event)" class="flex-1 text-xs" />
          <button type="button" (click)="importarSeccion(); seccionFile.value = ''" [disabled]="!nuevaSeccionTitulo.trim() || !seccionFileSeleccionado || importandoSeccion"
            class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {{ importandoSeccion ? 'Importando...' : 'Importar sección' }}
          </button>
        </div>
      } @else {
        <div class="flex items-center gap-2">
          <input [(ngModel)]="seccionUrlDrive" placeholder="Pega aquí el enlace de Google Sheets o Drive" class="input-field flex-1" />
          <button type="button" (click)="importarSeccionDesdeUrl()" [disabled]="!nuevaSeccionTitulo.trim() || !seccionUrlDrive.trim() || importandoSeccion"
            class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {{ importandoSeccion ? 'Cargando...' : 'Cargar datos' }}
          </button>
        </div>
        <p class="text-[11px] text-slate-400">El archivo debe ser público o estar compartido como "Cualquiera con el enlace".</p>
      }

      @if (errorSeccion) { <p class="text-xs text-red-500">{{errorSeccion}}</p> }
      @if (exitoSeccion) { <p class="text-xs text-green-600">{{exitoSeccion}}</p> }
    </div>

    <!-- Lista -->
    <div class="space-y-2">
      @for (s of secciones; track s.key) {
        <div class="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ s.tabla?.titulo || s.grafico?.titulo }}</p>
            <p class="text-xs text-slate-400">{{ s.tabla?.filas?.length || 0 }} filas · {{ s.grafico?.datos?.length || 0 }} puntos</p>
          </div>
          <button type="button" (click)="eliminarSeccion(s)" class="text-slate-300 hover:text-red-500 transition shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      }
      @if (!secciones.length) { <p class="text-sm text-slate-400 italic text-center py-6">Sin secciones — importa una arriba.</p> }
    </div>
  </div>
</div>
  `,
})
export class Boscometro implements OnInit {

  config!: BoscometroPageConfig;
  guardado = false;
  guardandoConfig = false;

  secciones: SeccionBoscometro[] = [];

  nuevaSeccionTitulo = '';
  nuevaSeccionSubtitulo = '';
  fuenteSeccion: 'archivo' | 'google' = 'archivo';
  seccionFileSeleccionado: File | null = null;
  seccionUrlDrive = '';
  importandoSeccion = false;
  errorSeccion = '';
  exitoSeccion = '';

  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerSeccion: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private recursos: RecursosApiService,
    private pageSvc: BoscometroPageService,
  ) {}

  ngOnInit(): void {
    this.config = this.pageSvc.getCopia();
    this.pageSvc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
    this.cargarRecursos();
  }

  private cargarRecursos(): void {
    this.recursos.listByTipo(TIPO_TABLA, TIPO_GRAFICO).subscribe(list => {
      this.secciones = this.construirSecciones(list);
    });
  }

  /** Agrupa tablas y gráficos por `seccionId`; los recursos legacy sin seccionId
   * (o con solo tabla o solo gráfico) se muestran igual, cada uno como su propia sección. */
  private construirSecciones(list: RecursoApi[]): SeccionBoscometro[] {
    const map = new Map<string, SeccionBoscometro>();
    for (const r of list) {
      const key = r.seccionId || r._id;
      const s = map.get(key) || { key, orden: r.orden };
      if (r.tipo === TIPO_TABLA) s.tabla = r; else if (r.tipo === TIPO_GRAFICO) s.grafico = r;
      s.orden = Math.min(s.orden, r.orden);
      map.set(key, s);
    }
    return [...map.values()].sort((a, b) => a.orden - b.orden);
  }

  onChangeConfig(): void { this.guardado = false; }

  guardarConfig(): void {
    this.guardandoConfig = true;
    this.pageSvc.guardar(this.config).subscribe({
      next: () => {
        this.guardandoConfig = false;
        this.guardado = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.guardado = false, 3000);
      },
      error: () => { this.guardandoConfig = false; },
    });
  }

  onSeccionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.seccionFileSeleccionado = input.files?.[0] ?? null;
  }

  importarSeccion(): void {
    if (!this.seccionFileSeleccionado || !this.nuevaSeccionTitulo.trim()) return;
    this.errorSeccion = '';
    this.importandoSeccion = true;
    this.recursos.importarSeccionBoscometro(this.nuevaSeccionTitulo.trim(), this.nuevaSeccionSubtitulo.trim(), this.seccionFileSeleccionado).subscribe({
      next: () => {
        this.importandoSeccion = false;
        this.nuevaSeccionTitulo = '';
        this.nuevaSeccionSubtitulo = '';
        this.seccionFileSeleccionado = null;
        this.mostrarExitoSeccion();
        this.cargarRecursos();
      },
      error: (err) => {
        this.importandoSeccion = false;
        this.errorSeccion = err?.error?.detail || 'No se pudo importar el archivo. Verifica que tenga 2 hojas: tabla y gráfico.';
      },
    });
  }

  importarSeccionDesdeUrl(): void {
    if (!this.seccionUrlDrive.trim() || !this.nuevaSeccionTitulo.trim()) return;
    this.errorSeccion = '';
    this.importandoSeccion = true;
    this.recursos.importarSeccionBoscometroDesdeUrl(this.nuevaSeccionTitulo.trim(), this.nuevaSeccionSubtitulo.trim(), this.seccionUrlDrive.trim()).subscribe({
      next: () => {
        this.importandoSeccion = false;
        this.nuevaSeccionTitulo = '';
        this.nuevaSeccionSubtitulo = '';
        this.seccionUrlDrive = '';
        this.mostrarExitoSeccion();
        this.cargarRecursos();
      },
      error: (err) => {
        this.importandoSeccion = false;
        this.errorSeccion = err?.error?.detail || 'No se pudo cargar el archivo desde Google Drive.';
      },
    });
  }

  private mostrarExitoSeccion(): void {
    this.exitoSeccion = 'Datos cargados correctamente.';
    if (this.timerSeccion) clearTimeout(this.timerSeccion);
    this.timerSeccion = setTimeout(() => this.exitoSeccion = '', 4000);
  }

  eliminarSeccion(s: SeccionBoscometro): void {
    const ids = [s.tabla?._id, s.grafico?._id].filter((id): id is string => !!id);
    if (!ids.length) return;
    let restantes = ids.length;
    ids.forEach(id => this.recursos.delete(id).subscribe({
      next: () => { if (--restantes === 0) this.cargarRecursos(); },
      error: () => { if (--restantes === 0) this.cargarRecursos(); },
    }));
  }
}
