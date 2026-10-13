import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Íconos curados (nombres de Material Symbols/Icons) para uso general en el panel. */
export const DEFAULT_ICON_OPTIONS: string[] = [
  'science', 'sports_soccer', 'sports_basketball', 'sports_tennis', 'directions_run',
  'music_note', 'theater_comedy', 'palette', 'brush', 'camera_alt', 'mic',
  'computer', 'code', 'biotech', 'calculate', 'rocket_launch',
  'eco', 'volunteer_activism', 'groups', 'forum', 'handshake', 'campaign',
  'menu_book', 'auto_stories', 'language', 'public',
  'emoji_events', 'star', 'celebration',
];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      @if (label) {
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{{ label }}</label>
      }

      <button #trigger type="button" (click)="toggle(trigger)" [disabled]="disabled"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
        <span class="material-symbols-outlined text-lg text-primary shrink-0">{{ value || 'help_outline' }}</span>
        <span class="flex-1 text-left truncate text-xs">{{ value || 'Elegir ícono...' }}</span>
        <span class="material-symbols-outlined text-base text-slate-400 shrink-0 transition-transform" [class.rotate-180]="open">expand_more</span>
      </button>

      @if (open) {
        <div #panel [style.top.px]="popTop" [style.left.px]="popLeft"
          class="fixed z-[1000] w-72 max-h-[300px] overflow-y-auto p-2 grid grid-cols-5 gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
          @for (icon of icons; track icon) {
            <button type="button" (click)="select(icon)" [title]="icon"
              class="flex items-center justify-center h-10 rounded-lg transition-colors"
              [class.bg-primary]="icon === value"
              [class.text-white]="icon === value"
              [class.hover:bg-slate-100]="icon !== value"
              [class.dark:hover:bg-slate-700]="icon !== value"
              [class.text-slate-600]="icon !== value"
              [class.dark:text-slate-300]="icon !== value">
              <span class="material-symbols-outlined text-xl">{{ icon }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class IconPickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() icons: string[] = DEFAULT_ICON_OPTIONS;

  value = '';
  disabled = false;
  open = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private panelEl?: HTMLElement;

  /** Mueve el panel a <body> para que ningún ancestro con transform/overflow altere su posición fixed. */
  @ViewChild('panel') set panel(ref: ElementRef<HTMLElement> | undefined) {
    this.panelEl = ref?.nativeElement;
    if (this.panelEl && this.panelEl.parentNode !== document.body) {
      document.body.appendChild(this.panelEl);
    }
  }

  popTop = 0;
  popLeft = 0;

  toggle(trigger?: HTMLElement): void {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open && trigger) this.position(trigger);
  }

  /** Posiciona el panel con coordenadas de viewport para que no lo recorte ningún contenedor con overflow. */
  private position(trigger: HTMLElement): void {
    const r = trigger.getBoundingClientRect();
    const margin = 12;
    const panelW = 288;
    const panelH = Math.min(300, window.innerHeight - margin * 2);
    const below = window.innerHeight - r.bottom - margin;
    const above = r.top - margin;
    let top: number;
    if (below >= panelH) top = r.bottom + 4;
    else if (above >= panelH) top = r.top - panelH - 4;
    else top = (window.innerHeight - panelH) / 2; // sin espacio: centrado verticalmente en pantalla
    this.popTop = Math.max(margin, Math.min(top, window.innerHeight - panelH - margin));
    this.popLeft = Math.max(margin, Math.min(r.left, window.innerWidth - panelW - margin));
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.open = false;
  }

  select(icon: string): void {
    this.value = icon;
    this.onChange(icon);
    this.onTouched();
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.open && !this.elementRef.nativeElement.contains(target) && !this.panelEl?.contains(target)) {
      this.open = false;
    }
  }
}
