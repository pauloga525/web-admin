/**
 * @file notification.ts
 * @description Notificaciones del panel, respaldadas por el backend. Se generan solas
 * cuando otro administrador crea, edita o elimina contenido; el estado leído/eliminado
 * es propio de cada usuario.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models';
import { AuthService } from './auth.service';

interface NotifApi {
  _id: string;
  titulo: string;
  descripcion?: string;
  leido: boolean;
  createdAt: string;
}

const REFRESCO_MS = 20000;

/** El backend guarda UTC sin sufijo de zona; sin "Z" el navegador lo leería como hora local. */
function aFecha(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:?\d{2}$/i.test(iso) ? iso : iso + 'Z');
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly url = `${environment.apiUrl}/notificaciones`;
  private subject = new BehaviorSubject<Notificacion[]>([]);

  /** Lista de notificaciones del usuario (más recientes primero). */
  notificaciones$ = this.subject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.recargar();
    interval(REFRESCO_MS).subscribe(() => this.recargar());
    window.addEventListener('focus', () => this.recargar());
  }

  recargar(): void {
    if (!this.auth.isAuthenticated()) return;
    this.http.get<NotifApi[]>(this.url).subscribe({
      next: lista => this.subject.next(lista.map(n => ({
        id: n._id,
        titulo: n.titulo,
        descripcion: n.descripcion ?? '',
        fecha: aFecha(n.createdAt),
        leida: n.leido,
        eliminada: false,
      }))),
      error: () => {},
    });
  }

  // ─── Consultas ──────────────────────────────────────────────────────────────

  getPendientes(): Notificacion[] {
    return this.subject.value.filter(n => !n.leida);
  }

  getLeidas(): Notificacion[] {
    return this.subject.value.filter(n => n.leida);
  }

  // ─── Mutaciones (actualización optimista) ───────────────────────────────────

  marcarComoLeida(n: Notificacion): void {
    this.subject.next(this.subject.value.map(x => x.id === n.id ? { ...x, leida: true } : x));
    this.http.patch(`${this.url}/${n.id}/leer`, {}).subscribe({ error: () => this.recargar() });
  }

  marcarTodasLeidas(): void {
    this.subject.next(this.subject.value.map(n => ({ ...n, leida: true })));
    this.http.patch(`${this.url}/leer-todas`, {}).subscribe({ error: () => this.recargar() });
  }

  eliminarNotificacion(n: Notificacion): void {
    this.subject.next(this.subject.value.filter(x => x.id !== n.id));
    this.http.delete(`${this.url}/${n.id}`).subscribe({ error: () => this.recargar() });
  }

  // ─── Utilidades ─────────────────────────────────────────────────────────────

  /** @example "Ahora", "Hace 5 min", "Ayer", "Hace 2 sem" */
  getTiempoRelativo(fecha: Date): string {
    const diff    = Math.max(0, Date.now() - new Date(fecha).getTime());
    const min     = Math.floor(diff / 60000);
    const horas   = Math.floor(diff / 3600000);
    const dias    = Math.floor(diff / 86400000);
    const semanas = Math.floor(diff / 604800000);
    const meses   = Math.floor(diff / 2592000000);

    if (min     <  1) return 'Ahora';
    if (min     < 60) return `Hace ${min} min`;
    if (horas   < 24) return `Hace ${horas} h`;
    if (dias    === 1) return 'Ayer';
    if (dias    <  7) return `Hace ${dias} días`;
    if (semanas <  4) return `Hace ${semanas} sem`;
    return `Hace ${meses} mes`;
  }
}
