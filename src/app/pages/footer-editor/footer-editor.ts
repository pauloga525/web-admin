import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteFooterService, SiteFooterConfig, FooterQuickLink, FooterBottomLink, FooterRedSocial } from '../../services/site-footer.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

type Tab = 'marca' | 'contacto' | 'enlaces' | 'pie';

@Component({
  selector: 'app-footer-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-4xl mx-auto w-full space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Footer del sitio</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Logo, contacto, redes, enlaces rápidos y pie de página.</p>
    </div>
    <button type="button" (click)="guardar()" [class]="guardado ? 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-500 text-white transition' : 'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md shadow-primary/20'">
      @if (guardado) { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Guardado
      } @else { <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios }
    </button>
  </div>

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id" [class]="tabActiva === t.id ? 'px-5 py-3 text-xs font-bold border-b-2 border-primary text-primary' : 'px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 transition'">{{t.label}}</button>
        }
      </div>
    </div>
    <div class="p-6">

      <!-- MARCA -->
      @if (tabActiva === 'marca') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-image-url-input
            label="Logo"
            [(ngModel)]="config.logoUrl"
            (ngModelChange)="onChange()"
            placeholder="/logo.png"
            previewHeight="h-28"
            fit="contain"
            alt="Logo del footer" />
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto alternativo</label>
            <input [(ngModel)]="config.logoAlt" (ngModelChange)="onChange()" class="input-field" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción institucional</label>
            <textarea [(ngModel)]="config.descripcion" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Redes sociales</h3>
          <button type="button" (click)="agregarRed()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <div class="space-y-2">
          @for (r of config.redes; track trackById($index, r)) {
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <select [(ngModel)]="r.icon" (ngModelChange)="r.label = redesOpciones[r.icon] || r.label; onChange()"
              class="input-field text-xs shrink-0 py-1" style="width:140px">
              @for (opt of redesOpcionesList; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
            <span class="text-xs text-slate-400 shrink-0 w-24">{{ redesOpciones[r.icon] || r.icon }}</span>
            <input [(ngModel)]="r.href" (ngModelChange)="onChange()" placeholder="URL de la red social" class="flex-1 input-field text-sm" />
            <button type="button" (click)="eliminarRed(r.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
          }
        </div>
      </div>
      }

      <!-- CONTACTO -->
      @if (tabActiva === 'contacto') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de la columna</label>
          <input [(ngModel)]="config.contactoTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
        <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dirección</label>
          <input [(ngModel)]="config.direccion" (ngModelChange)="onChange()" class="input-field" /></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teléfono 1</label>
            <input [(ngModel)]="config.telefono1" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teléfono 2</label>
            <input [(ngModel)]="config.telefono2" (ngModelChange)="onChange()" class="input-field" /></div>
          <div class="md:col-span-2"><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
            <input [(ngModel)]="config.email" (ngModelChange)="onChange()" type="email" class="input-field" /></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-image-url-input
            label="Imagen del mapa"
            [(ngModel)]="config.mapaImagen"
            (ngModelChange)="onChange()"
            placeholder="https://..."
            previewHeight="h-28"
            alt="Mapa" />
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver en mapa"</label>
            <input [(ngModel)]="config.mapaUrl" (ngModelChange)="onChange()" placeholder="https://maps.google.com/..." class="input-field" /></div>
        </div>
      </div>
      }

      <!-- ENLACES -->
      @if (tabActiva === 'enlaces') {
      <div class="space-y-5 animate-[fadeIn_.2s_ease_forwards]">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Título de la columna</h3>
            </div>
          </div>
          <input [(ngModel)]="config.quickLinksTitulo" (ngModelChange)="onChange()" class="input-field mb-4" />
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Enlaces rápidos</h3>
            <button type="button" (click)="agregarQuickLink()" class="text-xs text-primary hover:underline flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
            </button>
          </div>
          <div class="space-y-2">
            @for (l of config.quickLinks; track trackById($index, l)) {
            <div class="flex items-center gap-2">
              <input [(ngModel)]="l.label" (ngModelChange)="onChange()" placeholder="Etiqueta" class="flex-1 input-field text-sm" />
              <input [(ngModel)]="l.href" (ngModelChange)="onChange()" placeholder="URL o /ruta" class="flex-1 input-field text-sm" />
              <button type="button" (click)="eliminarQuickLink(l.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
            }
          </div>
        </div>
      </div>
      }

      <!-- PIE -->
      @if (tabActiva === 'pie') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Texto de copyright</label>
          <input [(ngModel)]="config.copyright" (ngModelChange)="onChange()" class="input-field" /></div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Enlaces del pie</h3>
          <button type="button" (click)="agregarFooterLink()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <div class="space-y-2">
          @for (l of config.footerLinks; track trackById($index, l)) {
          <div class="flex items-center gap-2">
            <input [(ngModel)]="l.label" (ngModelChange)="onChange()" placeholder="Etiqueta" class="flex-1 input-field text-sm" />
            <input [(ngModel)]="l.href" (ngModelChange)="onChange()" placeholder="URL" class="flex-1 input-field text-sm" />
            <button type="button" (click)="eliminarFooterLink(l.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
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
export class FooterEditor implements OnInit {

  config!: SiteFooterConfig;
  tabActiva: Tab = 'marca';
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  tabs: { id: Tab; label: string }[] = [
    { id: 'marca',    label: 'Marca & Redes' },
    { id: 'contacto', label: 'Contacto'      },
    { id: 'enlaces',  label: 'Enlaces'       },
    { id: 'pie',      label: 'Pie'           },
  ];

  readonly redesOpciones: Record<string, string> = {
    facebook:  'Facebook',
    instagram: 'Instagram',
    twitter:   'Twitter / X',
    youtube:   'YouTube',
    tiktok:    'TikTok',
    spotify:   'Spotify',
  };

  readonly redesOpcionesList = Object.entries(this.redesOpciones)
    .map(([value, label]) => ({ value, label }));

  constructor(private svc: SiteFooterService) {}
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

  trackById(i: number, item: { id: number }): number { return item.id; }

  agregarRed(): void { this.config.redes.push({ id: this.svc.nextId(), icon: 'public', label: '', href: '#' }); this.onChange(); }
  eliminarRed(id: number): void { this.config.redes = this.config.redes.filter(r => r.id !== id); this.onChange(); }

  agregarQuickLink(): void { this.config.quickLinks.push({ id: this.svc.nextId(), label: '', href: '#' }); this.onChange(); }
  eliminarQuickLink(id: number): void { this.config.quickLinks = this.config.quickLinks.filter(l => l.id !== id); this.onChange(); }

  agregarFooterLink(): void { this.config.footerLinks.push({ id: this.svc.nextId(), label: '', href: '#' }); this.onChange(); }
  eliminarFooterLink(id: number): void { this.config.footerLinks = this.config.footerLinks.filter(l => l.id !== id); this.onChange(); }
}
