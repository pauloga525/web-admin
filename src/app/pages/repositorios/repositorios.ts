import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RepositoriosService, RepositoriosConfig, RepoColeccion, RepoPublicacion, RepoNavLink, RepoStat } from '../../services/repositorios.service';

type Tab = 'hero' | 'colecciones' | 'publicaciones' | 'sidebar' | 'enlaces';

@Component({
  selector: 'app-repositorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="p-8 max-w-5xl mx-auto w-full space-y-6">
  <div class="flex items-center justify-between">
    <div><h1 class="text-xl font-bold text-slate-800 dark:text-white">Repositorios</h1><p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública del Repositorio Digital.</p></div>
    <button type="button" (click)="guardar()" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios }
    </button>
  </div>
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id" [class]="tabActiva === t.id ? 'px-5 py-3 text-xs font-bold border-b-2 border-primary text-primary' : 'px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition'">{{t.label}}</button>
        }
      </div>
    </div>
    <div class="p-6">

      @if (tabActiva === 'hero') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Ícono del badge</label><input [(ngModel)]="config.heroBadgeIcon" (ngModelChange)="onChange()" placeholder="school" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto del badge</label><input [(ngModel)]="config.heroBadgeText" (ngModelChange)="onChange()" class="input-field" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label><input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChange()" class="input-field font-semibold" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subtítulo</label><textarea [(ngModel)]="config.heroSubtitulo" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estadísticas del hero</h3>
          <button type="button" (click)="agregarStat()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (s of config.heroStats; track trackById($index, s)) {
          <div class="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <div class="flex-1 space-y-1.5">
              <input [(ngModel)]="s.numero" (ngModelChange)="onChange()" placeholder="Número (ej: 1,240+)" class="w-full input-field text-sm font-bold text-primary" />
              <input [(ngModel)]="s.etiqueta" (ngModelChange)="onChange()" placeholder="Etiqueta" class="w-full input-field text-xs" />
            </div>
            <button type="button" (click)="eliminarStat(s.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          }
        </div>
      </div>
      }

      @if (tabActiva === 'colecciones') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Colecciones</h3>
          <button type="button" (click)="agregarColeccion()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="space-y-3">
          @for (c of config.colecciones; track trackById($index, c)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div class="flex items-center gap-2">
              <input [(ngModel)]="c.icon" (ngModelChange)="onChange()" placeholder="Ícono material" class="w-32 input-field text-xs" />
              <input [(ngModel)]="c.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
              <input [(ngModel)]="c.count" (ngModelChange)="onChange()" placeholder="Count" class="w-20 input-field text-xs text-center" />
              <button type="button" (click)="eliminarColeccion(c.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
            <textarea [(ngModel)]="c.description" (ngModelChange)="onChange()" rows="2" placeholder="Descripción" class="w-full input-field resize-none text-sm"></textarea>
          </div>
          }
        </div>
      </div>
      }

      @if (tabActiva === 'publicaciones') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label><input [(ngModel)]="config.pubTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver todo"</label><input [(ngModel)]="config.pubVerTodoUrl" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Publicaciones recientes</h3>
          <button type="button" (click)="agregarPublicacion()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
        </div>
        <div class="space-y-3">
          @for (p of config.publicaciones; track trackById($index, p)) {
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
            <div class="flex items-center gap-2">
              <input [(ngModel)]="p.type" (ngModelChange)="onChange()" placeholder="Tipo" class="w-32 input-field text-xs" />
              <input [(ngModel)]="p.title" (ngModelChange)="onChange()" placeholder="Título" class="flex-1 input-field font-semibold" />
              <button type="button" (click)="eliminarPublicacion(p.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="p.authors" (ngModelChange)="onChange()" placeholder="Autores" class="flex-1 input-field text-sm" />
              <input [(ngModel)]="p.date" (ngModelChange)="onChange()" placeholder="Año" class="w-20 input-field text-sm" />
              <select [(ngModel)]="p.access" (ngModelChange)="onChange()" class="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0">
                <option value="open">Acceso Abierto</option><option value="restricted">Restringido</option>
              </select>
            </div>
          </div>
          }
        </div>
      </div>
      }

      @if (tabActiva === 'sidebar') {
      <div class="space-y-5 animate-[fadeIn_.2s_ease_forwards]">
        <div class="space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Guía de autoarchivo</h3>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label><input [(ngModel)]="config.guiaTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto</label><textarea [(ngModel)]="config.guiaTexto" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto del botón</label><input [(ngModel)]="config.guiaBotonLabel" (ngModelChange)="onChange()" class="input-field" /></div>
            <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL del botón</label><input [(ngModel)]="config.guiaUrl" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" /></div>
          </div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Links de navegación</h3>
            <button type="button" (click)="agregarNavLink()" class="text-xs text-primary hover:underline flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar</button>
          </div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Título de la sección</label><input [(ngModel)]="config.navTitulo" (ngModelChange)="onChange()" class="input-field mb-3" /></div>
          <div class="space-y-2">
            @for (l of config.navLinks; track trackById($index, l)) {
            <div class="flex items-center gap-2">
              <input [(ngModel)]="l.icon" (ngModelChange)="onChange()" placeholder="Ícono" class="w-28 input-field text-xs" />
              <input [(ngModel)]="l.label" (ngModelChange)="onChange()" placeholder="Etiqueta" class="flex-1 input-field text-sm" />
              <input [(ngModel)]="l.href" (ngModelChange)="onChange()" placeholder="URL" class="flex-1 input-field text-sm" />
              <button type="button" (click)="eliminarNavLink(l.id)" class="text-slate-300 hover:text-red-500 transition shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            }
          </div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Soporte bibliotecario</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Horario</label><input [(ngModel)]="config.soporteHorario" (ngModelChange)="onChange()" class="input-field" /></div>
            <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label><input [(ngModel)]="config.soporteEmail" (ngModelChange)="onChange()" type="email" class="input-field" /></div>
          </div>
        </div>
      </div>
      }

      @if (tabActiva === 'enlaces') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección</label><input [(ngModel)]="config.enlacesTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
          <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div class="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
            <p>Los logos de esta sección son los mismos que se muestran en Campus y en la página principal — se editan en un solo lugar para evitar que queden desincronizados.</p>
            <a routerLink="/campus" class="font-semibold underline hover:no-underline inline-block">Ir a Campus → Plataformas</a>
          </div>
        </div>
      </div>
      }

    </div>
  </div>
</div>
  `,
})export class Repositorios implements OnInit {

  config!: RepositoriosConfig;
  tabActiva: Tab = 'hero';
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',         label: 'Hero'         },
    { id: 'colecciones',  label: 'Colecciones'  },
    { id: 'publicaciones',label: 'Publicaciones'},
    { id: 'sidebar',      label: 'Sidebar'      },
    { id: 'enlaces',      label: 'Enlaces'      },
  ];

  constructor(private svc: RepositoriosService) {}

  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.svc.config$.subscribe(config => { this.config = JSON.parse(JSON.stringify(config)); });
  }

  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe({
      next: () => {
        this.guardado = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.guardado = false, 3000);
      },
      error: err => console.error('[Repositorios] Error al guardar:', err),
    });
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // Stats
  agregarStat(): void { this.config.heroStats.push({ id: this.svc.nextId(), numero: '', etiqueta: '' }); this.onChange(); }
  eliminarStat(id: number): void { this.config.heroStats = this.config.heroStats.filter(s => s.id !== id); this.onChange(); }

  // Colecciones
  agregarColeccion(): void { this.config.colecciones.push({ id: this.svc.nextId(), icon: 'folder', title: '', description: '', count: '0' }); this.onChange(); }
  eliminarColeccion(id: number): void { this.config.colecciones = this.config.colecciones.filter(c => c.id !== id); this.onChange(); }

  // Publicaciones
  agregarPublicacion(): void { this.config.publicaciones.push({ id: this.svc.nextId(), type: '', title: '', authors: '', date: '', access: 'open' }); this.onChange(); }
  eliminarPublicacion(id: number): void { this.config.publicaciones = this.config.publicaciones.filter(p => p.id !== id); this.onChange(); }

  // Nav links
  agregarNavLink(): void { this.config.navLinks.push({ id: this.svc.nextId(), icon: 'link', label: '', href: '#' }); this.onChange(); }
  eliminarNavLink(id: number): void { this.config.navLinks = this.config.navLinks.filter(l => l.id !== id); this.onChange(); }
}
