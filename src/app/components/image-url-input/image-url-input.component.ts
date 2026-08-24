import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-url-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUrlInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="space-y-2">
      @if (label) {
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400">{{ label }}</label>
      }

      @if (showPreview) {
        @if (value) {
          <div [class]="previewClass">
            <img [src]="value" [alt]="alt" [class]="imageClass" />
            <div class="absolute top-2 right-2 flex gap-1.5">
              <button type="button" (click)="openFilePicker()" [disabled]="disabled || uploading"
                class="px-2 py-1 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-700 transition shadow">
                {{ uploading ? 'Subiendo...' : 'Cambiar' }}
              </button>
              <button type="button" (click)="clear()"
                class="px-2 py-1 bg-red-500/90 text-white text-[10px] font-semibold rounded-lg hover:bg-red-600 transition shadow">
                Quitar
              </button>
            </div>
          </div>
        } @else {
          <button type="button" (click)="openFilePicker()" [disabled]="disabled || uploading"
            [class]="emptyClass">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="text-sm">{{ uploading ? 'Subiendo...' : 'Subir imagen o pegar URL' }}</span>
          </button>
        }
      }

      <div class="flex items-center gap-2">
        <input
          [ngModel]="value"
          (ngModelChange)="commit($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button type="button" (click)="openFilePicker()" [disabled]="disabled || uploading"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Subir
        </button>
      </div>

      <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />

      @if (error) {
        <p class="text-[11px] text-red-500">{{ error }}</p>
      }
    </div>
  `,
})
export class ImageUrlInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'https://...';
  @Input() alt = 'Vista previa';
  @Input() showPreview = true;
  @Input() previewHeight = 'h-44';
  @Input() fit: 'cover' | 'contain' = 'cover';
  @Input() uploadUrl = `${environment.apiUrl}/configuracion/imagenes`;
  @Output() valueChanged = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  value = '';
  disabled = false;
  error = '';
  uploading = false;

  constructor(private http: HttpClient) {}

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get previewClass(): string {
    return `relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 ${this.previewHeight}`;
  }

  get imageClass(): string {
    return `w-full h-full object-${this.fit}`;
  }

  get emptyClass(): string {
    return `w-full ${this.previewHeight} rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:border-primary hover:bg-primary/5 transition`;
  }

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

  openFilePicker(): void {
    if (this.disabled) return;
    this.fileInput?.nativeElement.click();
  }

  commit(value: string): void {
    this.error = '';
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.valueChanged.emit(value);
  }

  clear(): void {
    this.commit('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Selecciona una imagen JPG, PNG o WebP.';
      input.value = '';
      return;
    }

    const MAX_RAW_FILE_SIZE = 15 * 1024 * 1024; // 15 MB raw file
    if (file.size > MAX_RAW_FILE_SIZE) {
      this.error = 'La imagen es demasiado grande. Usa una imagen menor a 15 MB.';
      input.value = '';
      return;
    }

    this.uploading = true;
    this.error = '';
    this.uploadImageFile(file)
      .then(url => this.commit(url))
      .catch(() => {
        this.error = 'No se pudo subir la imagen. Verifica que el backend esté activo o usa una URL pública.';
      })
      .finally(() => {
        this.uploading = false;
      });

    input.value = '';
  }

  private uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return lastValueFrom(this.http.post<{ url: string }>(this.uploadUrl, formData)).then(response => {
      if (!response?.url) {
        throw new Error('No se recibió URL del servidor');
      }
      return response.url;
    });
  }
}
