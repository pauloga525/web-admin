import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BibliotecaService, BibliotecaConfig, LibroCategoria } from '../../services/biblioteca.service';
import { RecursosApiService, RecursoApi } from '../../services/recursos-api.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

type Tab = 'hero' | 'catalogo' | 'categorias';

interface LibroForm {
  _id?:      string;
  title:     string;
  author:    string;
  image:     string;
  url:       string;
  available: boolean;
  isNew:     boolean;
  categoria: string;
}

const TIPO = 'libro';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Biblioteca</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de contenido de la página pública de Biblioteca.</p>
    </div>
    <button type="button" (click)="guardarTodo()" [disabled]="guardando"
      [class]="guardado
        ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition'
        : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20 disabled:opacity-60'">
      @if (guardado) {
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else {
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
      }
    </button>
  </div>
  <p class="text-xs text-slate-500 dark:text-slate-400 -mt-4">Este botón guarda el Hero, las categorías y <strong>todos</strong> los libros de la lista de abajo.</p>

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id"
            [class]="tabActiva === t.id
              ? 'px-5 py-3 text-xs font-bold border-b-2 border-primary text-primary'
              : 'px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition'">
            {{t.label}}
          </button>
        }
      </div>
    </div>

    <div class="p-6">

      @if (tabActiva === 'hero') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero</h3>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
          <input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChangeConfig()" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
          <textarea [(ngModel)]="config.heroDescripcion" (ngModelChange)="onChangeConfig()" rows="4" class="input-field resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título del catálogo</label>
          <input [(ngModel)]="config.catalogoTitulo" (ngModelChange)="onChangeConfig()" class="input-field" />
        </div>
      </div>
      }

      @if (tabActiva === 'catalogo') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Libros ({{libros.length}})</h3>
          <button type="button" (click)="agregarLibro()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar libro
          </button>
        </div>
        @if (errorLibro) { <p class="text-xs text-red-500">{{errorLibro}}</p> }
        <div class="space-y-3">
          @for (libro of libros; track $index) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-12 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden flex items-center justify-center">
                @if (libro.image) {
                  <img [src]="libro.image" [alt]="libro.title" class="w-full h-full object-cover" />
                } @else {
                  <svg class="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19a2 2 0 0 1 2-2h14"/><path d="M6 17V3h14v18H6z"/></svg>
                }
              </div>
              <div class="flex-1 space-y-2 min-w-0">
                <input [(ngModel)]="libro.title" placeholder="Título del libro" class="w-full input-field font-semibold" />
                <input [(ngModel)]="libro.author" placeholder="Autor" class="w-full input-field text-sm" />
              </div>
              <button type="button" (click)="eliminarLibro($index)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition shrink-0 mt-1">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="libro.image" placeholder="URL imagen portada" [showPreview]="false" />
              <input [(ngModel)]="libro.url" placeholder="Link del libro (URL)" class="flex-1 input-field text-xs min-w-0" />
              <select [(ngModel)]="libro.categoria"
                class="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0">
                @for (cat of config.categorias; track cat.id) {
                  <option [value]="cat.nombre">{{cat.nombre}}</option>
                }
              </select>
              <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input type="checkbox" [(ngModel)]="libro.available" class="rounded" />
                <span class="text-xs text-slate-500">Disponible</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input type="checkbox" [(ngModel)]="libro.isNew" class="rounded" />
                <span class="text-xs text-slate-500">Nuevo</span>
              </label>
            </div>
            <div class="flex items-center justify-end gap-3">
              <span class="text-[11px] text-slate-400">o usa "Guardar cambios" arriba para guardar todo junto</span>
              <button type="button" (click)="guardarLibro($index)" class="text-xs font-semibold text-primary hover:underline shrink-0">
                {{ libro._id ? 'Guardar solo este' : 'Crear solo este' }}
              </button>
            </div>
          </div>
          }
          @if (!libros.length) {
            <p class="text-sm text-slate-400 italic text-center py-8">Sin libros — agrega uno arriba.</p>
          }
        </div>
      </div>
      }

      @if (tabActiva === 'categorias') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categorías del buscador</h3>
          <button type="button" (click)="agregarCategoria()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500">Estas opciones aparecen en el filtro de búsqueda de la página pública.</p>
        <div class="space-y-2">
          @for (cat of config.categorias; track trackById($index, cat)) {
          <div class="flex items-center gap-2">
            <input [(ngModel)]="cat.nombre" (ngModelChange)="onChangeConfig()" placeholder="Nombre de la categoría" class="flex-1 input-field" />
            <button type="button" (click)="eliminarCategoria(cat.id)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
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
export class Biblioteca implements OnInit {

  config!: BibliotecaConfig;
  libros: LibroForm[] = [];
  tabActiva: Tab = 'hero';
  guardado = false;
  guardando = false;
  errorLibro = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',       label: 'Hero'       },
    { id: 'catalogo',   label: 'Catálogo'   },
    { id: 'categorias', label: 'Categorías' },
  ];

  constructor(
    private svc: BibliotecaService,
    private recursos: RecursosApiService,
  ) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
    this.cargarLibros();
  }

  private cargarLibros(): void {
    this.recursos.listByTipo(TIPO).subscribe(list => {
      this.libros = list.map(r => this.desdeRecurso(r));
    });
  }

  private desdeRecurso(r: RecursoApi): LibroForm {
    return {
      _id: r._id,
      title: r.titulo,
      author: r.descripcion,
      image: r.imagen,
      url: r.url,
      categoria: r.categoria,
      available: (r.tags ?? []).includes('disponible'),
      isNew: (r.tags ?? []).includes('nuevo'),
    };
  }

  private aRecurso(l: LibroForm, orden: number) {
    return {
      titulo: l.title,
      descripcion: l.author,
      imagen: l.image,
      url: l.url,
      categoria: l.categoria,
      tipo: TIPO,
      publicado: true,
      orden,
      tags: [...(l.available ? ['disponible'] : []), ...(l.isNew ? ['nuevo'] : [])],
    };
  }

  onChangeConfig(): void { this.guardado = false; }

  /**
   * Guarda TODO de una vez: Hero/categorías (clave 'biblioteca_page') y cada
   * libro de la lista como create/update en /recursos. Antes el botón
   * principal solo guardaba el Hero — si el usuario llenaba el catálogo y
   * solo usaba este botón, los libros nunca se enviaban al backend.
   */
  guardarTodo(): void {
    this.errorLibro = '';
    this.guardando = true;

    const librosConTitulo = this.libros.filter(l => l.title.trim().length > 0);
    const librosSinTitulo = this.libros.length - librosConTitulo.length;

    const config$ = this.svc.guardar(this.config).pipe(catchError(() => of(null)));
    const items$ = librosConTitulo.map((l, idx) => {
      const dto = this.aRecurso(l, idx);
      const req = l._id ? this.recursos.update(l._id, dto) : this.recursos.create(dto);
      return req.pipe(catchError(() => of(null)));
    });

    forkJoin([config$, ...items$]).subscribe(results => {
      this.guardando = false;
      const fallos = results.slice(1).filter(r => r === null).length;

      if (fallos > 0) {
        this.errorLibro = `${fallos} libro(s) no se pudieron guardar. Revisa tu conexión e inténtalo de nuevo.`;
      } else if (librosSinTitulo > 0) {
        this.errorLibro = `${librosSinTitulo} libro(s) sin título no se guardaron (el título es obligatorio).`;
      }

      this.cargarLibros();
      this.guardado = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.guardado = false, 3000);
    });
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  agregarLibro(): void {
    this.libros.push({ title: '', author: '', image: '', url: '', available: true, isNew: false, categoria: this.config.categorias[0]?.nombre ?? '' });
  }

  guardarLibro(index: number): void {
    this.errorLibro = '';
    const l = this.libros[index];
    if (!l.title) { this.errorLibro = 'El título es obligatorio.'; return; }
    const dto = this.aRecurso(l, index);
    const req = l._id ? this.recursos.update(l._id, dto) : this.recursos.create(dto);
    req.subscribe({
      next: () => this.cargarLibros(),
      error: () => { this.errorLibro = 'No se pudo guardar el libro.'; },
    });
  }

  eliminarLibro(index: number): void {
    const l = this.libros[index];
    if (!l._id) { this.libros.splice(index, 1); return; }
    this.recursos.delete(l._id).subscribe({
      next: () => this.cargarLibros(),
    });
  }

  agregarCategoria(): void {
    this.config.categorias.push({ id: this.svc.nextId(), nombre: '' });
    this.onChangeConfig();
  }
  eliminarCategoria(id: number): void { this.config.categorias = this.config.categorias.filter(c => c.id !== id); this.onChangeConfig(); }
}
