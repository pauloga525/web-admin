import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConsejoApiService, MiembroConsejoApi, MiembroConsejoDto } from '../../services/consejo-api.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

interface MiembroForm {
  _id?:        string;
  titulo:      string;
  nombre:      string;
  descripcion: string;
  imagen:      string;
}

@Component({
  selector: 'app-consejo-estudiantil',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Consejo Estudiantil</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de Consejo Estudiantil.</p>
    </div>
    <button type="button" (click)="guardarTodo()" [disabled]="guardando" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20 disabled:opacity-60'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {{ guardando ? 'Guardando...' : 'Guardar cambios' }} }
    </button>
  </div>
  <p class="text-xs text-slate-500 dark:text-slate-400 -mt-4">Este botón guarda <strong>todos</strong> los miembros de la lista de abajo (incluidas sus fotos).</p>

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Miembros ({{miembros.length}})</h3>
      <button type="button" (click)="agregarMiembro()" class="text-xs text-primary hover:underline flex items-center gap-1">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar miembro
      </button>
    </div>
    @if (error) { <p class="text-xs text-red-500 mb-3">{{error}}</p> }

    <div class="space-y-4">
      @for (m of miembros; track $index) {
      <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <app-image-url-input class="w-full md:w-40 shrink-0" [(ngModel)]="m.imagen" placeholder="URL de la foto" previewHeight="h-32" />
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Cargo</label>
            <input [(ngModel)]="m.titulo" placeholder="Ej: Presidente" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
            <input [(ngModel)]="m.nombre" placeholder="Nombre completo" class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <textarea [(ngModel)]="m.descripcion" rows="2" class="input-field resize-none"></textarea>
          </div>
        </div>
        <button type="button" (click)="eliminarMiembro($index)" class="text-slate-300 hover:text-red-500 transition shrink-0 self-start">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
      }
      @if (!miembros.length) {
        <p class="text-sm text-slate-400 italic text-center py-10">Sin miembros — agrega uno arriba.</p>
      }
    </div>
  </div>
</div>
  `,
})
export class ConsejoEstudiantil implements OnInit {

  miembros: MiembroForm[] = [];
  guardado = false;
  guardando = false;
  error = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: ConsejoApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.api.list().subscribe(list => {
      this.miembros = list.map(m => ({
        _id: m._id, titulo: m.titulo ?? '', nombre: m.nombre, descripcion: m.descripcion ?? '', imagen: m.imagen ?? '',
      }));
    });
  }

  agregarMiembro(): void {
    this.miembros.push({ titulo: '', nombre: '', descripcion: '', imagen: '' });
  }

  eliminarMiembro(index: number): void {
    const m = this.miembros[index];
    if (!m._id) { this.miembros.splice(index, 1); return; }
    this.api.delete(m._id).subscribe({ next: () => this.cargar() });
  }

  guardarTodo(): void {
    this.error = '';
    this.guardando = true;

    const conNombre = this.miembros.filter(m => m.nombre.trim().length > 0);
    const sinNombre = this.miembros.length - conNombre.length;

    const requests = conNombre.map((m, i) => {
      const dto: MiembroConsejoDto = {
        titulo: m.titulo, nombre: m.nombre, descripcion: m.descripcion, imagen: m.imagen,
        publicado: true, orden: i,
      };
      const req = m._id ? this.api.update(m._id, dto) : this.api.create(dto);
      return req.pipe(catchError(() => of(null)));
    });

    if (!requests.length) {
      this.guardando = false;
      if (sinNombre > 0) this.error = `${sinNombre} miembro(s) sin nombre no se guardaron (el nombre es obligatorio).`;
      this.guardado = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.guardado = false, 3000);
      return;
    }

    forkJoin(requests).subscribe(results => {
      this.guardando = false;
      const fallos = results.filter(r => r === null).length;

      if (fallos > 0) {
        this.error = `${fallos} miembro(s) no se pudieron guardar. Revisa tu conexión e inténtalo de nuevo.`;
      } else if (sinNombre > 0) {
        this.error = `${sinNombre} miembro(s) sin nombre no se guardaron (el nombre es obligatorio).`;
      }

      this.cargar();
      this.guardado = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.guardado = false, 3000);
    });
  }
}
