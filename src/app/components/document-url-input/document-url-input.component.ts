import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Igual que app-image-url-input, pero para subir un PDF/Word en vez de una
 * imagen. El archivo se sube a /documentos (GridFS, chunkeado) — no se
 * guarda como Base64 en el documento de configuración/recurso, así que no
 * infla la base de datos como pasaría si se embebiera el archivo entero.
 */
@Component({
  selector: 'app-document-url-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentUrlInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="space-y-2">
      @if (label) {
        <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400">{{ label }}</label>
      }

      <div class="flex items-center gap-2">
        <input
          [ngModel]="value"
          (ngModelChange)="commit($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        @if (value) {
          <a [href]="value" target="_blank" rel="noopener"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-6M9.5 11.5 12 9l2.5 2.5"/></svg>
            Ver
          </a>
        }
        <button type="button" (click)="openFilePicker()" [disabled]="disabled || uploading"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {{ uploading ? 'Subiendo...' : 'Subir archivo' }}
        </button>
      </div>

      <input #fileInput type="file" accept=".pdf,.doc,.docx" hidden (change)="onFileSelected($event)" />

      @if (fileName) {
        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">📄 {{ fileName }}</p>
      }
      @if (error) {
        <p class="text-[11px] text-red-500">{{ error }}</p>
      }
    </div>
  `,
})
export class DocumentUrlInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'https://... o sube un PDF/Word';
  @Input() uploadUrl = `${environment.apiUrl}/documentos`;
  @Output() valueChanged = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  value = '';
  disabled = false;
  error = '';
  uploading = false;
  fileName = '';

  constructor(private http: HttpClient) {}

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      this.error = 'Solo se permiten archivos PDF o Word (.pdf, .doc, .docx).';
      input.value = '';
      return;
    }

    const MAX_RAW_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_RAW_FILE_SIZE) {
      this.error = 'El archivo es demasiado grande. Usa uno menor a 25 MB.';
      input.value = '';
      return;
    }

    this.uploading = true;
    this.error = '';
    this.uploadDocumentFile(file)
      .then(url => {
        this.fileName = file.name;
        this.commit(url);
      })
      .catch(() => {
        this.error = 'No se pudo subir el archivo. Verifica que el backend esté activo o usa una URL pública.';
      })
      .finally(() => {
        this.uploading = false;
      });

    input.value = '';
  }

  private uploadDocumentFile(file: File): Promise<string> {
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
