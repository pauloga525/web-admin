import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface Plataforma {
  id:    number;
  name:  string;
  image: string;
  url:   string;
}

const KEY = 'edu_plataformas';

const DEFAULT: Plataforma[] = [
  { id: 1, name: 'Moodle',    image: '', url: '' },
  { id: 2, name: 'Microsoft', image: '', url: '' },
  { id: 3, name: 'Google',    image: '', url: '' },
];

@Injectable({ providedIn: 'root' })
export class PlataformasService {

  constructor(private configApi: ConfiguracionApiService) {}

  get(): Plataforma[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : DEFAULT.map(p => ({ ...p }));
    } catch { return DEFAULT.map(p => ({ ...p })); }
  }

  getCopia(): Plataforma[] { return JSON.parse(JSON.stringify(this.get())); }

  guardar(list: Plataforma[]): Observable<void> {
    return this.configApi.guardar('plataformas', list).pipe(
      tap(() => localStorage.setItem(KEY, JSON.stringify(list))),
      catchError(() => { localStorage.setItem(KEY, JSON.stringify(list)); return of(undefined as void); })
    );
  }

  cargarDesdeBackend(): Observable<Plataforma[]> {
    return this.configApi.get<Plataforma[]>('plataformas').pipe(
      // ConfiguracionApiService.get() convierte un 404 en {} (objeto vacío)
      // en vez de lanzar error — esta config es un array, así que hay que
      // detectar ese caso explícitamente en vez de dejar pasar un {} suelto.
      map(list => Array.isArray(list) && list.length ? list : DEFAULT.map(p => ({ ...p }))),
      tap(list => localStorage.setItem(KEY, JSON.stringify(list))),
      catchError(() => of(this.get()))
    );
  }

  nextId(): number { return Date.now(); }
}
