import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService, ContactoConfig, ContactoInfo, ContactoRed, ContactoAsunto } from '../../services/contacto.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

type Tab = 'hero' | 'info' | 'redes' | 'formulario';

const REDES = ['facebook','twitter','instagram','linkedin','youtube','tiktok'] as const;

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-4xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Contacto</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de Contacto.</p>
    </div>
    <button type="button" (click)="guardar()"
      [class]="guardado
        ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition'
        : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) {
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else {
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios
      }
    </button>
  </div>

  <!-- CARD con tabs -->
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

      <!-- ══ HERO ══ -->
      @if (tabActiva === 'hero') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero y mapa</h3>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
          <input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChange()" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
          <textarea [(ngModel)]="config.heroDescripcion" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mapa</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-image-url-input label="Imagen del mapa" [(ngModel)]="config.mapImageUrl" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-32" />
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver en Google Maps"</label>
            <input [(ngModel)]="config.mapLinkUrl" (ngModelChange)="onChange()" placeholder="https://maps.google.com/..." class="input-field" />
          </div>
        </div>
      </div>
      }

      <!-- ══ INFO ══ -->
      @if (tabActiva === 'info') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tarjetas de información</h3>
          <button type="button" (click)="agregarInfo()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <div class="space-y-4">
          @for (card of config.infoCards; track trackById($index, card)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <input [(ngModel)]="card.icon" (ngModelChange)="onChange()" placeholder="Ícono material" class="w-36 input-field text-xs" />
              <input [(ngModel)]="card.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
              <button type="button" (click)="eliminarInfo(card.id)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            <!-- Líneas de detalle -->
            <div class="space-y-1.5 pl-2">
              @for (det of card.details; track $index) {
              <div class="flex items-center gap-2">
                <input [ngModel]="det" (ngModelChange)="card.details[$index] = $event; onChange()" placeholder="Línea de detalle" class="flex-1 input-field text-sm" />
                <button type="button" (click)="eliminarDetalle(card, $index)" class="text-slate-300 hover:text-red-500 transition shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              }
              <button type="button" (click)="agregarDetalle(card)" class="text-xs text-slate-400 hover:text-primary flex items-center gap-1 transition">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar línea
              </button>
            </div>
            <input [(ngModel)]="card.extra" (ngModelChange)="onChange()" placeholder="Texto secundario (opcional)" class="w-full input-field text-xs text-slate-400" />
          </div>
          }
        </div>
      </div>
      }

      <!-- ══ REDES ══ -->
      @if (tabActiva === 'redes') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Redes sociales</h3>
          <button type="button" (click)="agregarRed()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <div class="space-y-2">
          @for (r of config.redes; track trackById($index, r)) {
          <div class="flex items-center gap-2">
            <select [(ngModel)]="r.red" (ngModelChange)="onChange()"
              class="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0 w-32">
              @for (red of redesDisponibles; track red) { <option [value]="red">{{red | titlecase}}</option> }
            </select>
            <input [(ngModel)]="r.nombre" (ngModelChange)="onChange()" placeholder="Nombre" class="w-28 input-field text-sm" />
            <input [(ngModel)]="r.url" (ngModelChange)="onChange()" placeholder="URL" class="flex-1 input-field text-sm" />
            <button type="button" (click)="eliminarRed(r.id)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
          }
        </div>
      </div>
      }

      <!-- ══ FORMULARIO ══ -->
      @if (tabActiva === 'formulario') {
      <div class="space-y-5 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título del formulario</label>
            <input [(ngModel)]="config.formTitulo" (ngModelChange)="onChange()" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto del botón enviar</label>
            <input [(ngModel)]="config.formBotonLabel" (ngModelChange)="onChange()" class="input-field" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción del formulario</label>
            <textarea [(ngModel)]="config.formDescripcion" (ngModelChange)="onChange()" rows="2" class="input-field resize-none"></textarea>
          </div>
        </div>

        <hr class="border-slate-100 dark:border-slate-800" />

        <!-- Asuntos con email destino -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Opciones de asunto</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Cada asunto tiene un correo destino al que se enviará el mensaje del usuario.</p>
            </div>
            <button type="button" (click)="agregarAsunto()" class="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
            </button>
          </div>
          <div class="space-y-2">
            @for (a of config.asuntos; track trackById($index, a)) {
            <div class="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div class="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Etiqueta (visible al usuario)</label>
                  <input [(ngModel)]="a.label" (ngModelChange)="onChange()" placeholder="Ej: Admisiones" class="w-full input-field text-sm" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Correo destino</label>
                  <div class="relative">
                    <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input [(ngModel)]="a.emailDestino" (ngModelChange)="onChange()" placeholder="correo@uets.edu.ec" class="w-full pl-8 input-field text-sm" />
                  </div>
                </div>
              </div>
              <button type="button" (click)="eliminarAsunto(a.id)" class="text-slate-300 dark:text-slate-600 hover:text-red-500 transition shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            }
          </div>
        </div>

      </div>
      }

    </div>
  </div>
</div>
  `,
})
export class Contacto implements OnInit {

  config!: ContactoConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  redesDisponibles = REDES;
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',       label: 'Hero & Mapa'  },
    { id: 'info',       label: 'Información'  },
    { id: 'redes',      label: 'Redes'        },
    { id: 'formulario', label: 'Formulario'   },
  ];

  constructor(private svc: ContactoService) {}
  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
  }
  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe();
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // Info cards
  agregarInfo(): void {
    this.config.infoCards.push({ id: this.svc.nextId(), icon: 'info', title: '', details: [''], extra: '' });
    this.onChange();
  }
  eliminarInfo(id: number): void { this.config.infoCards = this.config.infoCards.filter(c => c.id !== id); this.onChange(); }
  agregarDetalle(card: ContactoInfo): void { card.details.push(''); this.onChange(); }
  eliminarDetalle(card: ContactoInfo, i: number): void { card.details.splice(i, 1); this.onChange(); }

  // Redes
  agregarRed(): void {
    this.config.redes.push({ id: this.svc.nextId(), nombre: '', url: '', red: 'facebook' });
    this.onChange();
  }
  eliminarRed(id: number): void { this.config.redes = this.config.redes.filter(r => r.id !== id); this.onChange(); }

  // Asuntos
  agregarAsunto(): void {
    this.config.asuntos.push({ id: this.svc.nextId(), label: '', emailDestino: '' });
    this.onChange();
  }
  eliminarAsunto(id: number): void { this.config.asuntos = this.config.asuntos.filter(a => a.id !== id); this.onChange(); }
}
