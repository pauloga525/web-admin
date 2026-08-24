import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteHeaderService, SiteHeaderConfig, NavItem, NavSubItem } from '../../services/site-header.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

@Component({
  selector: 'app-header-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-4xl mx-auto w-full space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Header del sitio</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Logo, navegación, dropdowns y botón Aula Virtual.</p>
    </div>
    <button type="button" (click)="guardar()" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios }
    </button>
  </div>

  <!-- LOGO -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
    <h2 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Logo</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <app-image-url-input
        label="Logo"
        [(ngModel)]="config.logoUrl"
        (ngModelChange)="onChange()"
        placeholder="/logo.png"
        previewHeight="h-28"
        fit="contain"
        alt="Logo del sitio" />
      <div>
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto alternativo</label>
        <input [(ngModel)]="config.logoAlt" (ngModelChange)="onChange()" class="input-field" />
      </div>
    </div>
  </div>

  <!-- AULA VIRTUAL -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
    <h2 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Botón Aula Virtual</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto del botón</label>
        <input [(ngModel)]="config.aulaVirtualLabel" (ngModelChange)="onChange()" class="input-field" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL (enlace externo)</label>
        <input [(ngModel)]="config.aulaVirtualUrl" (ngModelChange)="onChange()" placeholder="https://..." class="input-field" />
      </div>
    </div>
  </div>

  <!-- NAVEGACIÓN -->
  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Menú de navegación</h2>
      <button type="button" (click)="agregarItem()" class="text-xs text-primary hover:underline flex items-center gap-1">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar ítem
      </button>
    </div>
    <div class="space-y-3">
      @for (item of config.navItems; track trackById($index, item)) {
      <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <!-- Ítem principal -->
        <div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50">
          <svg class="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
          <input [(ngModel)]="item.label" (ngModelChange)="onChange()" placeholder="Etiqueta" class="flex-1 input-field text-sm font-semibold" />
          <input [(ngModel)]="item.routerLink" (ngModelChange)="onChange()" placeholder="/ruta" class="flex-1 input-field text-sm" />
          <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
            <input type="checkbox" [(ngModel)]="item.hasDropdown" (ngModelChange)="onChange()" class="rounded" />
            <span class="text-xs text-slate-500">Dropdown</span>
          </label>
          <button type="button" (click)="eliminarItem($index)" class="text-slate-300 hover:text-red-500 transition shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
        <!-- Submenú (si tiene dropdown) -->
        @if (item.hasDropdown) {
        <div class="p-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Submenú</p>
          @for (sub of item.submenu; track $index) {
          <div class="flex items-center gap-2 pl-4">
            <input [ngModel]="sub.label" (ngModelChange)="sub.label = $event; onChange()" placeholder="Etiqueta" class="flex-1 input-field text-xs" />
            <input [ngModel]="sub.routerLink" (ngModelChange)="sub.routerLink = $event; onChange()" placeholder="/ruta" class="flex-1 input-field text-xs" />
            <button type="button" (click)="eliminarSubItem(item, $index)" class="text-slate-300 hover:text-red-500 transition shrink-0">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          }
          <button type="button" (click)="agregarSubItem(item)" class="text-xs text-slate-400 hover:text-primary flex items-center gap-1 pl-4 transition">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar subítem
          </button>
        </div>
        }
      </div>
      }
    </div>
  </div>
</div>
  `,
})
export class HeaderEditor implements OnInit {

  config!: SiteHeaderConfig;
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: SiteHeaderService) {}
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

  trackById(i: number, _item: unknown): number { return i; }

  agregarItem(): void {
    this.config.navItems.push({ label: '', routerLink: '/', hasDropdown: false, submenu: [] });
    this.onChange();
  }
  eliminarItem(i: number): void { this.config.navItems.splice(i, 1); this.onChange(); }

  agregarSubItem(item: NavItem): void {
    item.submenu.push({ label: '', routerLink: '/' });
    this.onChange();
  }
  eliminarSubItem(item: NavItem, i: number): void { item.submenu.splice(i, 1); this.onChange(); }
}
