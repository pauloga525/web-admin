/**
 * @file informes.ts
 * @description Informe del registro de actividad del panel administrativo.
 * Solo administradores. Se elige el periodo (y opcionalmente un usuario),
 * se consulta el historial y se puede descargar en Excel o imprimir / guardar como PDF.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InformesService, RegistroInforme } from '../../services/informes.service';
import { AuthService } from '../../services/auth.service';

const NOMBRES_MODULO: Record<string, string> = {
  eventos: 'Eventos', noticias: 'Noticias', especialidades: 'Especialidades',
  autoridades: 'Autoridades', estudiantes: 'Estudiantes', logros: 'Logros',
  users: 'Usuarios', recursos: 'Recursos', uniformes: 'Uniformes',
  consejo: 'Consejo estudiantil', configuracion: 'Configuración',
};

/** El backend guarda UTC sin sufijo de zona; sin "Z" el navegador lo leería como hora local. */
function aFecha(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:?\d{2}$/i.test(iso) ? iso : iso + 'Z');
}

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapar(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

interface FilaInforme {
  fecha: Date;
  usuario: string;
  usuarioId: string;
  modulo: string;
  accion: string;
  detalle: string;
}

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informes.html',
})
export class Informes {
  desde = hoy();
  hasta = hoy();
  usuarioId = '';

  filas: FilaInforme[] = [];
  usuarios: { id: string; nombre: string }[] = [];
  generado = false;
  cargando = false;
  descargando = false;
  error = '';
  /** Periodo y momento del último informe generado (para el encabezado impreso). */
  private generadoEn = new Date();
  private periodo = { desde: this.desde, hasta: this.hasta };

  constructor(private informes: InformesService, private auth: AuthService) {}

  get filasVisibles(): FilaInforme[] {
    return this.usuarioId ? this.filas.filter(f => f.usuarioId === this.usuarioId) : this.filas;
  }

  get generadoPor(): string {
    const u = this.auth.getCurrentUser();
    return u ? `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || u.username : '';
  }

  private validar(): boolean {
    this.error = '';
    if (!this.desde || !this.hasta) { this.error = 'Elige la fecha de inicio y la de fin.'; return false; }
    if (this.hasta < this.desde) { this.error = 'La fecha "hasta" no puede ser anterior a "desde".'; return false; }
    return true;
  }

  generar(): void {
    if (!this.validar()) return;
    this.cargando = true;
    this.informes.obtener(this.desde, this.hasta).subscribe({
      next: lista => {
        this.filas = lista.map(r => ({
          fecha: aFecha(r.createdAt),
          usuario: r.usuario || '—',
          usuarioId: r.usuarioId || '',
          modulo: NOMBRES_MODULO[r.entidad ?? ''] ?? (r.entidad || '—'),
          accion: r.titulo || '',
          detalle: r.descripcion || '',
        }));
        const mapa = new Map<string, string>();
        this.filas.forEach(f => f.usuarioId && mapa.set(f.usuarioId, f.usuario));
        this.usuarios = [...mapa].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
        if (this.usuarioId && !mapa.has(this.usuarioId)) this.usuarioId = '';
        this.periodo = { desde: this.desde, hasta: this.hasta };
        this.generadoEn = new Date();
        this.generado = true;
        this.cargando = false;
      },
      error: err => {
        this.error = err.status === 403 ? 'Solo los administradores pueden generar informes.' : 'No se pudo generar el informe.';
        this.cargando = false;
      },
    });
  }

  descargarExcel(): void {
    if (!this.generado) return;
    this.descargando = true;
    const { desde, hasta } = this.periodo;
    this.informes.descargarExcel(desde, hasta, this.usuarioId || undefined).subscribe({
      next: blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `informe-actividad_${desde}_${hasta}.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.descargando = false;
      },
      error: () => { this.error = 'No se pudo descargar el Excel.'; this.descargando = false; },
    });
  }

  /** Abre el informe en una ventana aparte lista para imprimir o "Guardar como PDF". */
  imprimir(): void {
    if (!this.generado) return;
    const fmt = (d: string) => d.split('-').reverse().join('/');
    const usuario = this.usuarios.find(u => u.id === this.usuarioId)?.nombre;
    const filas = this.filasVisibles.map(f => `
      <tr>
        <td>${f.fecha.toLocaleDateString('es-EC')}</td>
        <td>${f.fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${escapar(f.usuario)}</td>
        <td>${escapar(f.modulo)}</td>
        <td>${escapar(f.accion)}</td>
        <td>${escapar(f.detalle)}</td>
      </tr>`).join('');
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
      <title>Informe de actividad ${this.periodo.desde} - ${this.periodo.hasta}</title>
      <style>
        body{font-family:system-ui,sans-serif;color:#1e293b;margin:32px;font-size:12px}
        h1{font-size:18px;margin:0 0 6px} p{margin:2px 0;color:#475569}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#1e3a8a;color:#fff;text-align:left;padding:6px}
        td{border-bottom:1px solid #e2e8f0;padding:6px;vertical-align:top}
        tr{page-break-inside:avoid}
      </style></head><body>
      <h1>Informe de actividad del panel administrativo</h1>
      <p><b>Periodo:</b> ${fmt(this.periodo.desde)} al ${fmt(this.periodo.hasta)}</p>
      ${usuario ? `<p><b>Usuario:</b> ${escapar(usuario)}</p>` : ''}
      <p><b>Generado por:</b> ${escapar(this.generadoPor)} el ${this.generadoEn.toLocaleString('es-EC')}</p>
      <p><b>Total de registros:</b> ${this.filasVisibles.length}</p>
      <table><thead><tr><th>Fecha</th><th>Hora</th><th>Usuario</th><th>Módulo</th><th>Acción</th><th>Detalle</th></tr></thead>
      <tbody>${filas || '<tr><td colspan="6">Sin registros en este periodo.</td></tr>'}</tbody></table>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) { this.error = 'El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes.'; return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }
}
