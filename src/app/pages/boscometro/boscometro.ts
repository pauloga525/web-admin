import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecursosApiService, RecursoApi } from '../../services/recursos-api.service';
import { BoscometroPageService, BoscometroPageConfig } from '../../services/boscometro-page.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

const TIPO_TABLA = 'boscometro_tabla';
const TIPO_GRAFICO = 'boscometro_grafico';

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

  <!-- TABLAS -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tablas de puntajes ({{tablas.length}})</h3>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400">Sube un archivo Excel (.xlsx) — cada fila se convierte en una fila de la tabla. Las filas con color de fondo en el Excel se muestran resaltadas.</p>

    <!-- Form de importación -->
    <div class="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de la tabla</label>
        <input [(ngModel)]="nuevaTablaTitulo" placeholder="Ej: Tabla de Puntajes Obtenidos" class="input-field" />
      </div>
      <div class="flex items-center gap-2">
        <input #tablaFile type="file" accept=".xlsx,.xls" (change)="onTablaFileSelected($event)" class="flex-1 text-xs" />
        <button type="button" (click)="importarTabla(); tablaFile.value = ''" [disabled]="!nuevaTablaTitulo.trim() || !tablaFileSeleccionado || importandoTabla"
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ importandoTabla ? 'Importando...' : 'Importar tabla' }}
        </button>
      </div>
      @if (errorTabla) { <p class="text-xs text-red-500">{{errorTabla}}</p> }
    </div>

    <!-- Lista -->
    <div class="space-y-2">
      @for (t of tablas; track t._id) {
        <div class="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{t.titulo}}</p>
            <p class="text-xs text-slate-400">{{ t.filas?.length || 0 }} filas</p>
          </div>
          <button type="button" (click)="eliminarRecurso(t, 'tabla')" class="text-slate-300 hover:text-red-500 transition shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      }
      @if (!tablas.length) { <p class="text-sm text-slate-400 italic text-center py-6">Sin tablas — importa una arriba.</p> }
    </div>
  </div>

  <!-- GRÁFICOS -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gráficos ({{graficos.length}})</h3>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400">Sube un archivo Excel (.xlsx) con 2 columnas: <strong>Curso</strong> y <strong>Total</strong> — se genera un gráfico de barras automáticamente.</p>

    <!-- Form de importación -->
    <div class="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
          <input [(ngModel)]="nuevoGraficoTitulo" placeholder="Ej: Boscómetro Básica Elemental" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subtítulo (opcional)</label>
          <input [(ngModel)]="nuevoGraficoSubtitulo" placeholder="Ej: Boscómetro Preparatoria - Elemental 2025 - 2026" class="input-field" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input #graficoFile type="file" accept=".xlsx,.xls" (change)="onGraficoFileSelected($event)" class="flex-1 text-xs" />
        <button type="button" (click)="importarGrafico(); graficoFile.value = ''" [disabled]="!nuevoGraficoTitulo.trim() || !graficoFileSeleccionado || importandoGrafico"
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ importandoGrafico ? 'Importando...' : 'Importar gráfico' }}
        </button>
      </div>
      @if (errorGrafico) { <p class="text-xs text-red-500">{{errorGrafico}}</p> }
    </div>

    <!-- Lista -->
    <div class="space-y-2">
      @for (g of graficos; track g._id) {
        <div class="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <svg class="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{g.titulo}}</p>
            <p class="text-xs text-slate-400 truncate">{{ g.descripcion || 'Sin subtítulo' }} · {{ g.datos?.length || 0 }} puntos</p>
          </div>
          <button type="button" (click)="eliminarRecurso(g, 'grafico')" class="text-slate-300 hover:text-red-500 transition shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      }
      @if (!graficos.length) { <p class="text-sm text-slate-400 italic text-center py-6">Sin gráficos — importa uno arriba.</p> }
    </div>
  </div>
</div>
  `,
})
export class Boscometro implements OnInit {

  config!: BoscometroPageConfig;
  guardado = false;
  guardandoConfig = false;

  tablas: RecursoApi[] = [];
  graficos: RecursoApi[] = [];

  nuevaTablaTitulo = '';
  tablaFileSeleccionado: File | null = null;
  importandoTabla = false;
  errorTabla = '';

  nuevoGraficoTitulo = '';
  nuevoGraficoSubtitulo = '';
  graficoFileSeleccionado: File | null = null;
  importandoGrafico = false;
  errorGrafico = '';

  private timer: ReturnType<typeof setTimeout> | null = null;

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
      this.tablas = list.filter(r => r.tipo === TIPO_TABLA);
      this.graficos = list.filter(r => r.tipo === TIPO_GRAFICO);
    });
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

  onTablaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tablaFileSeleccionado = input.files?.[0] ?? null;
  }

  onGraficoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.graficoFileSeleccionado = input.files?.[0] ?? null;
  }

  importarTabla(): void {
    if (!this.tablaFileSeleccionado || !this.nuevaTablaTitulo.trim()) return;
    this.errorTabla = '';
    this.importandoTabla = true;
    this.recursos.importarTablaBoscometro(this.nuevaTablaTitulo.trim(), this.tablaFileSeleccionado).subscribe({
      next: () => {
        this.importandoTabla = false;
        this.nuevaTablaTitulo = '';
        this.tablaFileSeleccionado = null;
        this.cargarRecursos();
      },
      error: (err) => {
        this.importandoTabla = false;
        this.errorTabla = err?.error?.detail || 'No se pudo importar el archivo. Verifica que sea un Excel válido.';
      },
    });
  }

  importarGrafico(): void {
    if (!this.graficoFileSeleccionado || !this.nuevoGraficoTitulo.trim()) return;
    this.errorGrafico = '';
    this.importandoGrafico = true;
    this.recursos.importarGraficoBoscometro(this.nuevoGraficoTitulo.trim(), this.nuevoGraficoSubtitulo.trim(), this.graficoFileSeleccionado).subscribe({
      next: () => {
        this.importandoGrafico = false;
        this.nuevoGraficoTitulo = '';
        this.nuevoGraficoSubtitulo = '';
        this.graficoFileSeleccionado = null;
        this.cargarRecursos();
      },
      error: (err) => {
        this.importandoGrafico = false;
        this.errorGrafico = err?.error?.detail || 'No se pudo importar el archivo. Verifica que tenga 2 columnas: curso y total.';
      },
    });
  }

  eliminarRecurso(r: RecursoApi, tipo: 'tabla' | 'grafico'): void {
    this.recursos.delete(r._id).subscribe({ next: () => this.cargarRecursos() });
  }
}
