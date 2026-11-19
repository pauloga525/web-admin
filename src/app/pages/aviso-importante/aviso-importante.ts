/**
 * @file aviso-importante.ts
 * @description Editor del aviso importante de la portada (clave 'aviso_home').
 * La web pública lo muestra como una tarjeta sobre el borde inferior del hero.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionApiService } from '../../services/configuracion-api.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';

export interface AvisoHomeConfig {
  activo: boolean;
  imagenUrl: string;
  titulo: string;
  texto: string;
  botonTexto: string;
  enlace: string;
  /** yyyy-mm-dd; vacío = sin límite. */
  fechaInicio: string;
  fechaFin: string;
  /** Estilo visual de la tarjeta en la portada. */
  tema: 'general' | 'bingo';
}

const DEFAULT: AvisoHomeConfig = {
  activo: false,
  imagenUrl: '',
  titulo: '',
  texto: '',
  botonTexto: 'Ver más',
  enlace: '',
  fechaInicio: '',
  fechaFin: '',
  tema: 'general',
};

/** Bolas que se muestran en la vista previa del estilo Bingo. */
export const BOLAS_PREVIA = [
  { letra: 'B', numero: 7 }, { letra: 'I', numero: 22 }, { letra: 'N', numero: 41, clara: true },
  { letra: 'G', numero: 53 }, { letra: 'O', numero: 68 },
];

@Component({
  selector: 'app-aviso-importante',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlInputComponent],
  templateUrl: './aviso-importante.html',
})
export class AvisoImportante implements OnInit {
  config: AvisoHomeConfig = { ...DEFAULT };
  cargando = true;
  guardando = false;
  guardado = false;
  error = '';
  readonly bolas = BOLAS_PREVIA;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private configApi: ConfiguracionApiService) {}

  ngOnInit(): void {
    this.configApi.get<Partial<AvisoHomeConfig>>('aviso_home').subscribe({
      next: cfg => {
        // Avisos guardados antes de existir el campo 'tema': se deduce del título,
        // igual que hace la web pública, para que al guardar no cambie su aspecto.
        const tema = cfg?.tema ?? (/bingo/i.test(cfg?.titulo ?? '') ? 'bingo' : 'general');
        this.config = { ...DEFAULT, ...(cfg || {}), tema };
        this.cargando = false;
      },
      error: () => { this.error = 'No se pudo cargar el aviso. Revisa la conexión con el servidor.'; this.cargando = false; },
    });
  }

  onChange(): void { this.guardado = false; this.error = ''; }

  /** Problema que impide guardar; se muestra junto al botón. */
  get problema(): string {
    const c = this.config;
    const enlace = (c.enlace || '').trim();
    if (c.activo && !(c.titulo || '').trim() && !c.imagenUrl) return 'Agrega al menos un título o una imagen para publicar el aviso.';
    if (c.activo && c.tema === 'bingo' && !(c.titulo || '').trim()) return 'El estilo Bingo no muestra la imagen: agrega un título.';
    if (enlace && !(c.botonTexto || '').trim()) return 'Escribe el texto del botón o borra el enlace.';
    if (enlace && !/^(https?:\/\/|\/)/i.test(enlace)) return 'El enlace debe empezar con https:// o con / (página del sitio).';
    if (c.fechaInicio && c.fechaFin && c.fechaFin < c.fechaInicio) return 'La fecha de fin no puede ser anterior a la de inicio.';
    return '';
  }

  /** Lo que verá el público hoy con esta configuración. */
  get estado(): { texto: string; clase: string } {
    const c = this.config;
    if (!c.activo) return { texto: 'Oculto', clase: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
    const hoy = new Date().toLocaleDateString('en-CA');
    if (c.fechaInicio && hoy < c.fechaInicio) return { texto: `Programado desde ${c.fechaInicio}`, clase: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
    if (c.fechaFin && hoy > c.fechaFin) return { texto: 'Vencido', clase: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
    return { texto: 'Visible en la portada', clase: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
  }

  guardar(): void {
    if (this.problema || this.guardando) return;
    this.guardando = true;
    const datos: AvisoHomeConfig = {
      ...this.config,
      titulo: (this.config.titulo || '').trim(),
      texto: (this.config.texto || '').trim(),
      botonTexto: (this.config.botonTexto || '').trim(),
      enlace: (this.config.enlace || '').trim(),
    };
    this.configApi.guardar('aviso_home', datos).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.guardado = false, 3000);
      },
      error: () => { this.guardando = false; this.error = 'No se pudo guardar. Intenta de nuevo.'; },
    });
  }
}
