/**
 * @file kpi.service.ts
 * @description KPI cards del dashboard. Editables manualmente y preparados
 * para conectarse a una API en el futuro (campo `apiKey` para mapeo).
 * Persiste en el backend (clave: 'kpis') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface KpiCard {
  id:       string;   // identificador único
  label:    string;   // etiqueta visible
  value:    string;   // valor mostrado (string para flexibilidad: "1248", "6", "24")
  cambio:   string;   // texto de cambio opcional ("+12%", "Publicados", etc.)
  icono:    string;   // nombre del icono SVG interno
  color:    string;   // tailwind color class para el badge de cambio
  apiKey:   string;   // clave futura para conectar a API (ej: "total_estudiantes")
  visible:  boolean;
}

const KEY = 'edu_kpis';

const DEFAULT: KpiCard[] = [
  { id: 'estudiantes',   label: 'Estudiantes',    value: '1248', cambio: '+12%',      icono: 'users',     color: 'text-green-500', apiKey: 'total_estudiantes',   visible: true },
  { id: 'especialidades',label: 'Especialidades', value: '6',    cambio: '',          icono: 'book',      color: '',               apiKey: 'total_especialidades', visible: true },
  { id: 'eventos',       label: 'Eventos Activos',value: '0',    cambio: 'Publicados',icono: 'calendar',  color: 'text-primary/60',apiKey: 'total_eventos',       visible: true },
  { id: 'usuarios',      label: 'Usuarios',       value: '24',   cambio: '+8%',       icono: 'user',      color: 'text-green-500', apiKey: 'total_usuarios',      visible: true },
];

@Injectable({ providedIn: 'root' })
export class KpiService {

  private subject = new BehaviorSubject<KpiCard[]>(DEFAULT.map(k => ({ ...k })));
  kpis$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    // ConfiguracionApiService.get() convierte un 404 en {} (objeto vacío) en vez de
    // lanzar error — válido para configs tipo objeto, pero 'kpis' es un array, así
    // que hay que detectar ese caso explícitamente y no dejar pasar un {} suelto.
    this.configApi.get<KpiCard[]>('kpis').pipe(
      map(list => Array.isArray(list) && list.length ? list : DEFAULT.map(k => ({ ...k }))),
      catchError(() => of(this.cargarLocal()))
    ).subscribe(list => this.subject.next(list));
  }

  private cargarLocal(): KpiCard[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : DEFAULT.map(k => ({ ...k }));
    } catch { return DEFAULT.map(k => ({ ...k })); }
  }

  get(): KpiCard[] { return this.subject.value; }
  getCopia(): KpiCard[] { return JSON.parse(JSON.stringify(this.subject.value)); }

  guardar(list: KpiCard[]): Observable<void> {
    return this.configApi.guardar('kpis', list).pipe(
      tap(() => this.subject.next(list))
    );
  }
}
