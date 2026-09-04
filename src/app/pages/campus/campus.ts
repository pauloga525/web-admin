import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampusService, CampusConfig, CampusItem, CampusCaracteristica } from '../../services/campus.service';
import { PlataformasService, Plataforma } from '../../services/plataformas.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

type Tab = 'hero' | 'yanuncay' | 'crespi' | 'auxiliadora' | 'plataformas';

@Component({
  selector: 'app-campus',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  template: `
<div class="p-8 max-w-4xl mx-auto w-full space-y-6">

  <!-- HEADER -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">Campus</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Editor de la página pública de Campus.</p>
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

  <div class="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

    <!-- TABS -->
    <div class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <div class="flex">
        @for (t of tabs; track t.id) {
          <button type="button" (click)="tabActiva = t.id"
            [class]="tabActiva === t.id
              ? 'px-4 py-3 text-xs font-bold border-b-2 border-primary text-primary whitespace-nowrap'
              : 'px-4 py-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition whitespace-nowrap'">
            {{t.label}}
          </button>
        }
      </div>
    </div>

    <div class="p-6">

      <!-- ══ HERO ══ -->
      @if (tabActiva === 'hero') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero de la página</h3>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título</label>
          <input [(ngModel)]="config.heroTitulo" (ngModelChange)="onChange()" class="input-field" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Subtítulo</label>
          <textarea [(ngModel)]="config.heroSubtitulo" (ngModelChange)="onChange()" rows="2" class="input-field resize-none"></textarea>
        </div>
        <div>
          <app-image-url-input label="Imagen de fondo" [(ngModel)]="config.heroImagen" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-40" />
        </div>
      </div>
      }

      <!-- ══ CAMPUS (reutilizable para los 3) ══ -->
      @for (c of config.campus; track c.id) {
        @if (tabActiva === campusTabId(c.id)) {
        <div class="space-y-5 animate-[fadeIn_.2s_ease_forwards]">

          <!-- Datos generales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre del campus</label>
              <input [(ngModel)]="c.nombre" (ngModelChange)="onChange()" class="input-field font-semibold" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Badge / etiqueta</label>
              <input [(ngModel)]="c.badge" (ngModelChange)="onChange()" placeholder="Ej: Principal" class="input-field" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
              <textarea [(ngModel)]="c.descripcion" (ngModelChange)="onChange()" rows="3" class="input-field resize-none"></textarea>
            </div>
          </div>

          <hr class="border-slate-100 dark:border-slate-800" />

          <!-- Imágenes -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Imágenes</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Imagen principal</label>
                <div class="flex items-center gap-3">
                  <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="c.imagenPrincipal" (ngModelChange)="onChange()" placeholder="https://..." [showPreview]="false" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Imagen secundaria 1</label>
                <div class="flex items-center gap-3">
                  <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="c.imagenSecundaria1" (ngModelChange)="onChange()" placeholder="https://..." [showPreview]="false" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Imagen secundaria 2</label>
                <div class="flex items-center gap-3">
                  <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="c.imagenSecundaria2" (ngModelChange)="onChange()" placeholder="https://..." [showPreview]="false" />
                </div>
              </div>
            </div>
          </div>

          <hr class="border-slate-100 dark:border-slate-800" />

          <!-- Características -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Características</h3>
              <button type="button" (click)="agregarCaracteristica(c)" class="text-xs text-primary hover:underline flex items-center gap-1">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
              </button>
            </div>
            <div class="space-y-2">
              @for (f of c.caracteristicas; track trackById($index, f)) {
              <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                <!-- Vista previa del ícono -->
                <span class="material-symbols-outlined text-primary shrink-0 text-xl w-6 text-center">{{ f.icon || 'star' }}</span>
                <!-- Selector de ícono -->
                <select [(ngModel)]="f.icon" (ngModelChange)="onChange()"
                  class="input-field text-xs shrink-0 py-1" style="width:200px">
                  @for (opt of iconOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                <!-- Texto de la característica -->
                <input [(ngModel)]="f.label" (ngModelChange)="onChange()"
                  placeholder="Texto de la característica"
                  class="flex-1 input-field text-sm min-w-0" />
                <!-- Eliminar -->
                <button type="button" (click)="eliminarCaracteristica(c, f.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              }
            </div>
          </div>

          <hr class="border-slate-100 dark:border-slate-800" />

          <!-- Ubicación y mapa -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Ubicación y mapa</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dirección</label>
                <input [(ngModel)]="c.ubicacion" (ngModelChange)="onChange()" class="input-field" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <app-image-url-input label="Imagen del mapa" [(ngModel)]="c.mapaImagen" (ngModelChange)="onChange()" placeholder="https://..." previewHeight="h-28" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">URL "Ver Mapa"</label>
                  <input [(ngModel)]="c.mapaUrl" (ngModelChange)="onChange()" placeholder="https://maps.google.com/..." class="input-field text-sm" />
                </div>
              </div>
            </div>
          </div>

        </div>
        }
      }

      <!-- ══ PLATAFORMAS ══ -->
      @if (tabActiva === 'plataformas') {
      <div class="space-y-4 animate-[fadeIn_.2s_ease_forwards]">
        <div class="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-2">
          <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-xs text-blue-700 dark:text-blue-300">Este título y estos logos son los mismos en <strong>5 páginas</strong>: Campus, Repositorio Digital, Inicio, Biblioteca e Instructivos. Este es el único lugar donde se editan.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título de sección (se usa en las 5 páginas)</label>
            <input [(ngModel)]="config.plataformasTitulo" (ngModelChange)="onChange()" class="input-field" /></div>
          <div><label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Descripción (solo se usa aquí, en Campus)</label>
            <input [(ngModel)]="config.plataformasDescripcion" (ngModelChange)="onChange()" class="input-field" /></div>
        </div>
        <hr class="border-slate-100 dark:border-slate-800" />
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Plataformas</h3>
          <button type="button" (click)="agregarPlataforma()" class="text-xs text-primary hover:underline flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Agregar
          </button>
        </div>
        <div class="space-y-3">
          @for (p of plataformas; track trackById($index, p)) {
          <div class="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <div class="w-12 h-10 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              @if (p.image) { <img [src]="p.image" [alt]="p.name" class="w-full h-full object-contain p-1" /> }
              @else { <svg class="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
            </div>
            <input [(ngModel)]="p.name" (ngModelChange)="onChange()" placeholder="Nombre" class="w-28 input-field text-sm" />
            <app-image-url-input class="flex-1 min-w-0" [(ngModel)]="p.image" (ngModelChange)="onChange()" placeholder="URL logo" [showPreview]="false" />
            <input [(ngModel)]="p.url" (ngModelChange)="onChange()" placeholder="URL enlace" class="flex-1 input-field text-xs" />
            <button type="button" (click)="eliminarPlataforma(p.id)" class="text-slate-300 hover:text-red-500 transition shrink-0">
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
export class Campus implements OnInit {

  config!: CampusConfig;
  plataformas!: Plataforma[];
  guardadoPlataformas = false;
  tabActiva: Tab = 'hero';
  guardado = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly iconOptions: { value: string; label: string }[] = [
    { value: 'science',           label: 'science — Laboratorios'       },
    { value: 'menu_book',         label: 'menu_book — Biblioteca'       },
    { value: 'sports',            label: 'sports — Deportes'            },
    { value: 'sports_soccer',     label: 'sports_soccer — Fútbol'       },
    { value: 'fitness_center',    label: 'fitness_center — Gimnasio'    },
    { value: 'restaurant',        label: 'restaurant — Cafetería'       },
    { value: 'computer',          label: 'computer — Informática'       },
    { value: 'engineering',       label: 'engineering — Ingeniería'     },
    { value: 'biotech',           label: 'biotech — Biotecnología'      },
    { value: 'calculate',         label: 'calculate — Matemáticas'      },
    { value: 'palette',           label: 'palette — Arte'               },
    { value: 'music_note',        label: 'music_note — Música'          },
    { value: 'mic',               label: 'mic — Audio / Grabación'      },
    { value: 'theaters',          label: 'theaters — Auditorio'         },
    { value: 'park',              label: 'park — Zonas Verdes'          },
    { value: 'outdoor_grill',     label: 'outdoor_grill — Área Exterior'},
    { value: 'connected_tv',      label: 'connected_tv — Conferencias'  },
    { value: 'meeting_room',      label: 'meeting_room — Sala Reuniones'},
    { value: 'school',            label: 'school — Educación'           },
    { value: 'language',          label: 'language — Idiomas'           },
    { value: 'wifi',              label: 'wifi — WiFi'                  },
    { value: 'medical_services',  label: 'medical_services — Enfermería'},
    { value: 'directions_bus',    label: 'directions_bus — Transporte'  },
    { value: 'security',          label: 'security — Seguridad'         },
    { value: 'apartment',         label: 'apartment — Edificio'         },
    { value: 'local_library',     label: 'local_library — Biblioteca'   },
    { value: 'star',              label: 'star — General'               },
  ];

  tabs: { id: Tab; label: string }[] = [
    { id: 'hero',        label: 'Hero'             },
    { id: 'yanuncay',    label: 'Yanuncay'         },
    { id: 'crespi',      label: 'Carlos Crespi'    },
    { id: 'auxiliadora', label: 'María Auxiliadora'},
    { id: 'plataformas', label: 'Plataformas'      },
  ];

  // Mapea id del campus (1,2,3) al id del tab
  campusTabId(id: number): Tab {
    return (['yanuncay', 'crespi', 'auxiliadora'] as Tab[])[id - 1];
  }

  constructor(private svc: CampusService, private plataformasSvc: PlataformasService) {}
  ngOnInit(): void {
    this.config = this.svc.getCopia();
    this.plataformas = this.plataformasSvc.getCopia();
    this.svc.cargarDesdeBackend().subscribe(cfg => { this.config = cfg; });
    this.plataformasSvc.cargarDesdeBackend().subscribe(list => { this.plataformas = list; });
  }
  onChange(): void { this.guardado = false; }

  guardar(): void {
    this.svc.guardar(this.config).subscribe();
    this.plataformasSvc.guardar(this.plataformas).subscribe();
    this.guardado = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.guardado = false, 3000);
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  agregarCaracteristica(c: CampusItem): void {
    c.caracteristicas.push({ id: this.svc.nextId(), icon: 'star', label: '' });
    this.onChange();
  }
  eliminarCaracteristica(c: CampusItem, id: number): void {
    c.caracteristicas = c.caracteristicas.filter(f => f.id !== id);
    this.onChange();
  }

  agregarPlataforma(): void {
    this.plataformas.push({ id: this.plataformasSvc.nextId(), name: '', image: '', url: '' });
    this.onChange();
  }
  eliminarPlataforma(id: number): void {
    this.plataformas = this.plataformas.filter(p => p.id !== id);
    this.onChange();
  }
}
