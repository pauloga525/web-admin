import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
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

      <button type="button" (click)="toggle()" [disabled]="disabled"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
        <span class="material-symbols-outlined text-lg text-primary shrink-0">{{ value || 'help_outline' }}</span>
        <span class="flex-1 text-left truncate text-xs">{{ value || 'Elegir ícono...' }}</span>
        <span class="material-symbols-outlined text-base text-slate-400 shrink-0 transition-transform" [class.rotate-180]="open">expand_more</span>
      </button>

      @if (open) {
        <div class="absolute z-30 mt-1 w-64 max-h-56 overflow-y-auto p-2 grid grid-cols-5 gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
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

  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  select(icon: string): void {
    this.value = icon;
    this.onChange(icon);
    this.onTouched();
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }
}
