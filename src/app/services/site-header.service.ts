/**
 * @file site-header.service.ts
 * @description Gestiona la configuración del header del sitio público.
 * Persiste en el backend (clave: 'site_header') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface NavSubItem { label: string; routerLink: string; }
export interface NavItem {
  label:       string;
  routerLink:  string;
  hasDropdown: boolean;
  submenu:     NavSubItem[];
}

export interface SiteHeaderConfig {
  logoUrl:          string;
  logoAlt:          string;
  aulaVirtualUrl:   string;
  aulaVirtualLabel: string;
  navItems:         NavItem[];
}

const KEY = 'edu_site_header';

const DEFAULT: SiteHeaderConfig = {
  logoUrl:          '',
  logoAlt:          'Logo Unidad Educativa Ecuador',
  aulaVirtualUrl:   'https://edu.esemtia.com/LoginEsemtia.aspx',
  aulaVirtualLabel: 'Aula Virtual',
  navItems: [
    { label: 'Inicio',   routerLink: '/',         hasDropdown: false, submenu: [] },
    { label: 'Nosotros', routerLink: '/nosotros', hasDropdown: false, submenu: [] },
    {
      label: 'Académico', routerLink: '/academico', hasDropdown: true,
      submenu: [
        { label: 'Preparatoria',     routerLink: '/preparatoria'     },
        { label: 'Básica Elemental', routerLink: '/basica-elemental' },
        { label: 'Básica Media',     routerLink: '/basica-media'     },
        { label: 'Básica Superior',  routerLink: '/basica-superior'  },
        { label: 'Bachillerato',     routerLink: '/especialidades'   },
      ],
    },
    { label: 'Campus',   routerLink: '/campus',   hasDropdown: false, submenu: [] },
    { label: 'Eventos',  routerLink: '/eventos',  hasDropdown: false, submenu: [] },
    { label: 'Noticias', routerLink: '/noticias', hasDropdown: false, submenu: [] },
    { label: 'Contacto', routerLink: '/contacto', hasDropdown: false, submenu: [] },
  ],
};

@Injectable({ providedIn: 'root' })
export class SiteHeaderService {

  constructor(private configApi: ConfiguracionApiService) {}

  private cargarLocal(): SiteHeaderConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }

  get(): SiteHeaderConfig { return this.cargarLocal(); }

  getCopia(): SiteHeaderConfig { return JSON.parse(JSON.stringify(this.get())); }

  guardar(c: SiteHeaderConfig): Observable<void> {
    return this.configApi.guardar('site_header', c).pipe(
      tap(() => localStorage.setItem(KEY, JSON.stringify(c))),
      catchError(() => {
        localStorage.setItem(KEY, JSON.stringify(c));
        return of(undefined as void);
      })
    );
  }

  cargarDesdeBackend(): Observable<SiteHeaderConfig> {
    return this.configApi.get<SiteHeaderConfig>('site_header').pipe(
      tap(c => localStorage.setItem(KEY, JSON.stringify(c))),
      catchError(() => of(this.cargarLocal()))
    );
  }

  nextId(): number { return Date.now(); }
}
