import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Promocion } from '../../services/estudiantes-page.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-promociones-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="space-y-4">
  <!-- HEADER -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
      <input [(ngModel)]="titulo" (ngModelChange)="emitCambios()" placeholder="Nuestros Alumnos" class="input-field" />
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
      <input [(ngModel)]="descripcion" (ngModelChange)="emitCambios()" placeholder="Honrando el legado..." class="input-field" />
    </div>
  </div>

  <hr class="border-slate-100 dark:border-slate-800" />

  <!-- FILTER & ADD -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Años Disponibles</h3>
      <div class="flex flex-wrap gap-1">
        @for (ano of anos; track ano) {
        <button
          type="button"
          (click)="filtroAno = ano"
          [class]="filtroAno === ano
            ? 'px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white'
            : 'px-2.5 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition'">
          {{ano}}
        </button>
        }
      </div>
    </div>
    <button
      type="button"
      (click)="abrirModalAgregarPromocion()"
      class="text-xs text-primary hover:underline flex items-center gap-1">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      Agregar Generación
    </button>
  </div>

  <!-- PROMOCIONES FILTRADAS -->
  <div class="space-y-4">
    @if (promocionesAno.length === 0) {
    <div class="text-center py-8 text-slate-400 dark:text-slate-500">
      <p>No hay promociones para este año</p>
    </div>
    }

    @for (promo of promocionesAno; track promo.id) {
    <div class="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition">

      <!-- ENCABEZADO PROMOCIÓN -->
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de Generación</label>
          <input
            [(ngModel)]="promo.classOf"
            (ngModelChange)="emitCambios()"
            placeholder="Promoción 2024"
            class="input-field text-sm font-semibold w-full" />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL de Galería</label>
          <input
            [(ngModel)]="promo.url"
            (ngModelChange)="emitCambios()"
            placeholder="https://..."
            class="input-field text-sm w-full" />
        </div>
        <button
          type="button"
          (click)="eliminarPromocion(promo.id)"
          class="text-slate-300 hover:text-red-500 transition shrink-0 mt-6">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      <!-- CURSOS -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cursos/Secciones</label>
          <button
            type="button"
            (click)="agregarCurso(promo)"
            class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Agregar Curso
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (curso of promo.cursos; track curso.id) {
          <div class="border border-slate-100 dark:border-slate-700 rounded-xl p-3 space-y-2 bg-slate-50 dark:bg-slate-800/30">

            <!-- IMAGEN CON DRAG & DROP O ARCHIVO -->
            <div class="relative group">
              <div class="space-y-2 mb-3">
                <div class="flex gap-2">
                  <label
                    class="flex-1 h-40 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer transition group-hover:border-primary group-hover:bg-slate-50 dark:group-hover:bg-slate-600"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event, curso)">

                    @if (uploadingCursos.has(curso.id)) {
                    <div class="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      <span class="text-xs">Subiendo...</span>
                    </div>
                    } @else if (curso.image) {
                    <img [src]="curso.image" [alt]="curso.name" class="w-full h-full object-cover hover:opacity-75 transition" />
                    } @else {
                    <div class="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span class="text-xs text-center px-2">Arrastra imagen o selecciona</span>
                    </div>
                    }
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onFileSelected($event, curso)"
                      class="hidden" />
                  </label>
                  @if (curso.image) {
                  <button
                    type="button"
                    (click)="curso.image = ''; emitCambios()"
                    class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shrink-0">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                  }
                </div>
                
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  <p>La imagen se sube al servidor automáticamente (máx. 15MB).</p>
                </div>
              </div>
            </div>

            <!-- NOMBRE DEL CURSO -->
            <div>
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Nombre (ej: 3A, 3B)</label>
              <input
                [(ngModel)]="curso.name"
                (ngModelChange)="emitCambios()"
                placeholder="3A"
                class="input-field text-sm w-full" />
            </div>

            <!-- BOTÓN ELIMINAR -->
            <button
              type="button"
              (click)="eliminarCurso(promo, curso.id)"
              class="w-full py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
              Eliminar
            </button>
          </div>
          }
        </div>

        @if (!promo.cursos || promo.cursos.length === 0) {
        <div class="text-center py-6 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <p class="text-sm">Sin cursos agregados</p>
        </div>
        }
      </div>
    </div>
    }
  </div>

  <!-- MODAL AGREGAR PROMOCIÓN -->
  @if (modalAbierto) {
  <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-background-dark rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
      <!-- HEADER MODAL -->
      <div class="border-b border-slate-200 dark:border-slate-800 p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Nueva Generación</h3>
          <button
            type="button"
            (click)="cerrarModal()"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- CONTENIDO MODAL -->
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Año de Promoción</label>
          <div class="flex gap-2">
            <input
              type="number"
              [(ngModel)]="modalNuevoAno"
              placeholder="2024"
              class="input-field flex-1" />
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center">o selecciona:</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            @for (ano of anos; track ano) {
            <button
              type="button"
              (click)="modalNuevoAno = ano"
              [class]="modalNuevoAno === ano
                ? 'px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white'
                : 'px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition'">
              {{ano}}
            </button>
            }
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Nombre (ej: Promoción 2024)</label>
          <input
            type="text"
            [(ngModel)]="modalNuevoNombre"
            placeholder="Promoción 2024"
            class="input-field w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">URL de Galería (opcional)</label>
          <input
            type="text"
            [(ngModel)]="modalNuevoUrl"
            placeholder="https://..."
            class="input-field w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Cantidad de Cursos</label>
          <div class="flex gap-2">
            <button
              type="button"
              (click)="decrementarCursos()"
              class="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              −
            </button>
            <input
              type="number"
              [(ngModel)]="modalCursosCount"
              min="1"
              class="input-field flex-1 text-center" />
            <button
              type="button"
              (click)="incrementarCursos()"
              class="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              +
            </button>
          </div>
        </div>
      </div>

      <!-- FOOTER MODAL -->
      <div class="border-t border-slate-200 dark:border-slate-800 p-6 flex gap-3">
        <button
          type="button"
          (click)="cerrarModal()"
          class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          Cancelar
        </button>
        <button
          type="button"
          (click)="guardarNuevaPromocion()"
          class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition">
          Crear Generación
        </button>
      </div>
    </div>
  </div>
  }
</div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .input-field {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-slate-200);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }
    .dark .input-field {
      background-color: var(--color-slate-800);
      border-color: var(--color-slate-700);
      color: white;
    }
    .input-field:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-opacity-1);
    }
  `],
})
export class PromocioneManagerComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() descripcion: string = '';

  uploadingCursos = new Set<number>();

  @Input() set promociones(value: Promocion[]) {
    this._promociones = JSON.parse(JSON.stringify(value));
    this.actualizarAnos();
  }
  get promociones(): Promocion[] {
    return this._promociones;
  }
  private _promociones: Promocion[] = [];

  @Output() cambios = new EventEmitter<{
    titulo: string;
    descripcion: string;
    promociones: Promocion[];
  }>();

  filtroAno: number | null = null;

  anos: number[] = [];
  
  dragState: { [key: number]: boolean } = {};

  // Modal
  modalAbierto = false;
  modalNuevoAno: number = new Date().getFullYear();
  modalNuevoNombre: string = '';
  modalNuevoUrl: string = '#';
  modalCursosCount: number = 1;

  // Contador para IDs únicos
  private idCounter: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.idCounter = Math.max(...this.promociones.flatMap(p => p.cursos?.map(c => c.id) || []), 0) + 1;
    if (this.anos.length > 0) {
      this.filtroAno = this.anos[0];
    }
  }

  get promocionesAno(): Promocion[] {
    if (!this.filtroAno) return this.promociones;
    return this.promociones.filter(p => this.extraerAno(p.classOf) === this.filtroAno);
  }

  extraerAno(classOf: string): number {
    const match = classOf.match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : new Date().getFullYear();
  }

  actualizarAnos(): void {
    const anosUnicos = new Set(this.promociones.map(p => this.extraerAno(p.classOf)));
    this.anos = Array.from(anosUnicos).sort((a, b) => b - a);
    if (this.anos.length === 0) {
      this.anos = [new Date().getFullYear()];
    }
  }

  agregarPromocion(): void {
    const nextId = this.promociones.length > 0
      ? Math.max(...this.promociones.map(p => p.id)) + 1
      : Date.now();
    const ano = this.filtroAno || new Date().getFullYear();
    const newPromo: Promocion = {
      id: nextId,
      classOf: `Promoción ${ano}`,
      cursos: [this.crearCursoNuevo()],
      url: '#',
    };
    this.promociones.push(newPromo);
    this.actualizarAnos();
    this.emitCambios();
  }

  abrirModalAgregarPromocion(): void {
    this.modalAbierto = true;
    this.modalNuevoAno = this.filtroAno || new Date().getFullYear();
    this.modalNuevoNombre = `Promoción ${this.modalNuevoAno}`;
    this.modalNuevoUrl = '#';
    this.modalCursosCount = 1;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  incrementarCursos(): void {
    this.modalCursosCount++;
  }

  decrementarCursos(): void {
    if (this.modalCursosCount > 1) {
      this.modalCursosCount--;
    }
  }

  guardarNuevaPromocion(): void {
    if (!this.modalNuevoNombre.trim()) {
      alert('Por favor ingresa el nombre de la generación');
      return;
    }

    const nextId = this.promociones.length > 0
      ? Math.max(...this.promociones.map(p => p.id)) + 1
      : Date.now();

    const cursos = Array.from({ length: this.modalCursosCount }, () => this.crearCursoNuevo());

    const newPromo: Promocion = {
      id: nextId,
      classOf: this.modalNuevoNombre,
      cursos: cursos,
      url: this.modalNuevoUrl,
    };

    this.promociones.push(newPromo);
    this.actualizarAnos();
    this.filtroAno = this.modalNuevoAno;
    this.emitCambios();
    this.cerrarModal();
  }

  agregarCurso(promo: Promocion): void {
    if (!promo.cursos) promo.cursos = [];
    promo.cursos.push(this.crearCursoNuevo());
    this.emitCambios();
  }

  crearCursoNuevo() {
    const nextId = this.idCounter++;
    return { id: nextId, name: '', image: '', url: '#' };
  }

  eliminarCurso(promo: Promocion, cursoId: number): void {
    if (!promo.cursos) return;
    promo.cursos = promo.cursos.filter(c => c.id !== cursoId);
    this.emitCambios();
  }

  eliminarPromocion(promoId: number): void {
    this.promociones = this.promociones.filter(p => p.id !== promoId);
    this.actualizarAnos();
    this.emitCambios();
  }

  // Nota: Las imagenes se comprimen y se guardan como Base64 en la BD.

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
  }

  onDrop(e: DragEvent, curso: any): void {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0], curso);
    }
  }

  onFileSelected(e: Event, curso: any): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0], curso);
    }
  }

  procesarArchivo(file: File, curso: any): void {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen (JPG, PNG, etc)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('La imagen no debe superar 15MB.');
      return;
    }

    this.uploadingCursos.add(curso.id);

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post<{ url: string }>(`${environment.apiUrl}/configuracion/imagenes`, formData).subscribe({
      next: (result) => {
        curso.image = result.url;
        this.uploadingCursos.delete(curso.id);
        this.emitCambios();
      },
      error: () => {
        this.uploadingCursos.delete(curso.id);
        alert('Error al subir la imagen. Verifica la conexión e inténtalo de nuevo.');
      },
    });
  }

  emitCambios(): void {
    this.cambios.emit({
      titulo: this.titulo,
      descripcion: this.descripcion,
      promociones: this.promociones,
    });
  }
}
