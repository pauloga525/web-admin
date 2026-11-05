/**
 * @file activity.ts
 * @description Historial de actividad del panel. Los registros los genera el backend
 * automáticamente con cada cambio (crear, editar, eliminar); este servicio solo los
 * consulta y los mantiene actualizados.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval } from 'rxjs';
import { environment } from '../../environments/environment';
import { Actividad, GrupoActividad, TipoActividad } from '../models';
import { AuthService } from './auth.service';

interface ActividadApi {
  _id: string;
  tipo: TipoActividad;
  titulo?: string;
  descripcion: string;
  usuario?: string;
  createdAt: string;
}

const REFRESCO_MS = 20000;

/** El backend guarda UTC sin sufijo de zona; sin "Z" el navegador lo leería como hora local. */
function aFecha(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:?\d{2}$/i.test(iso) ? iso : iso + 'Z');
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly url = `${environment.apiUrl}/actividad`;
  private actividades: Actividad[] = [];
  private readonly subject = new BehaviorSubject<Actividad[]>([]);

  /** Emite cada vez que cambia el historial. */
  actividades$ = this.subject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.recargar();
    interval(REFRESCO_MS).subscribe(() => this.recargar());
    window.addEventListener('focus', () => this.recargar());
  }

  // ─── Carga ──────────────────────────────────────────────────────────────────

  /** Vuelve a pedir el historial al backend (solo con sesión activa). */
  recargar(): void {
    if (!this.auth.isAuthenticated()) return;
    this.http.get<ActividadApi[]>(this.url).subscribe({
      next: lista => {
        this.actividades = lista.map(a => ({
          _id: a._id,
          tipo: a.tipo,
          titulo: a.titulo || 'Actividad',
          descripcion: a.descripcion,
          usuario: a.usuario,
          fecha: aFecha(a.createdAt),
        }));
        this.actividades.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.subject.next(this.actividades);
      },
      error: () => {},
    });
  }

  // ─── Consultas ──────────────────────────────────────────────────────────────

  getActividades(): Actividad[] {
    return this.actividades;
  }

  getTotalActividades(): number {
    return this.actividades.length;
  }

  /** Retorna las N actividades más recientes (por defecto 6). */
  getActividadesRecientes(n = 6): Actividad[] {
    return this.actividades.slice(0, n);
  }

  /** Agrupa las actividades por día calendario (Hoy, Ayer, Hace N días). */
  getActividadesAgrupadas(): GrupoActividad[] {
    const grupos: Record<string, { orden: number; items: Actividad[] }> = {};
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    for (const a of this.actividades) {
      const dia = new Date(a.fecha);
      dia.setHours(0, 0, 0, 0);
      const diff = Math.max(0, Math.round((inicioHoy.getTime() - dia.getTime()) / 86400000));
      const titulo = diff === 0 ? 'Hoy' : diff === 1 ? 'Ayer' : `Hace ${diff} días`;
      (grupos[titulo] ??= { orden: diff, items: [] }).items.push(a);
    }

    return Object.entries(grupos)
      .sort(([, a], [, b]) => a.orden - b.orden)
      .map(([titulo, { items }]) => ({ titulo, items }));
  }

  /** Actividad registrada hace menos de 5 minutos (badge "nuevo"). */
  isNuevaActividad(a: Actividad): boolean {
    return (Date.now() - new Date(a.fecha).getTime()) / 60000 <= 5;
  }

  // ─── Mutaciones ─────────────────────────────────────────────────────────────

  eliminarActividad(a: Actividad): void {
    if (!a._id) return;
    this.http.delete(`${this.url}/${a._id}`).subscribe({
      next: () => {
        this.actividades = this.actividades.filter(x => x._id !== a._id);
        this.subject.next(this.actividades);
      },
      error: () => {},
    });
  }

  /** El backend purga el historial de más de 30 días al consultarlo; se mantiene por compatibilidad. */
  limpiarAntiguos(): number {
    return 0;
  }

  // ─── Utilidades ─────────────────────────────────────────────────────────────

  /** @example "Ahora", "Hace 5 min", "Hace 2 h", "Hace 3 días" */
  getTiempoRelativo(fecha: Date): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const min  = Math.max(0, Math.floor(diff / 60000));
    const h    = Math.floor(diff / 3600000);
    const d    = Math.floor(diff / 86400000);

    if (min < 1)  return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    if (h   < 24) return `Hace ${h} h`;
    return `Hace ${d} día${d > 1 ? 's' : ''}`;
  }
}
