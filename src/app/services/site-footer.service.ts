/**
 * @file site-footer.service.ts
 * @description Gestiona la configuración del footer del sitio público.
 * Persiste en el backend (clave: 'site_footer') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface FooterQuickLink  { id: number; label: string; href: string; }
export interface FooterBottomLink { id: number; label: string; href: string; }
export interface FooterRedSocial  { id: number; icon: string; href: string; label: string; }

export interface SiteFooterConfig {
  logoUrl:     string;
  logoAlt:     string;
  descripcion: string;
  redes:       FooterRedSocial[];
  quickLinksTitulo: string;
  quickLinks:       FooterQuickLink[];
  contactoTitulo: string;
  direccion:      string;
  telefono1:      string;
  telefono2:      string;
  email:          string;
  mapaImagen:  string;
  mapaUrl:     string;
  copyright:   string;
  footerLinks: FooterBottomLink[];
}

const KEY = 'edu_site_footer';

const DEFAULT: SiteFooterConfig = {
  logoUrl:     '',
  logoAlt:     'Logo UETS',
  descripcion: 'Educar es nuestra pasión, la excelencia nuestra meta. Una institución comprometida con el desarrollo integral de la juventud ecuatoriana.',
  redes: [
    { id: 1, icon: 'facebook',  href: 'https://www.facebook.com/uetscuenca',                                 label: 'Facebook'  },
    { id: 2, icon: 'instagram', href: 'https://www.instagram.com/uetscuenca',                                label: 'Instagram' },
    { id: 3, icon: 'twitter',   href: 'https://x.com/uetscue',                                              label: 'Twitter'   },
    { id: 4, icon: 'youtube',   href: 'https://www.youtube.com/c/UET%C3%A9cnicoSalesiano',                  label: 'YouTube'   },
    { id: 5, icon: 'tiktok',    href: 'https://www.tiktok.com/@uetscuenca',                                 label: 'TikTok'    },
    { id: 6, icon: 'spotify',   href: 'https://open.spotify.com/intl-es/artist/5gLwRDP95HalLhHv7P6eeC',   label: 'Spotify'   },
  ],
  quickLinksTitulo: 'Enlaces Rápidos',
  quickLinks: [
    { id: 1, label: 'Inicio',         href: '/'               },
    { id: 2, label: 'Nosotros',       href: '/nosotros'       },
    { id: 3, label: 'Especialidades', href: '/especialidades' },
    { id: 4, label: 'Admisiones',     href: '/admisiones'     },
    { id: 5, label: 'Eventos',        href: '/eventos'        },
    { id: 6, label: 'Contacto',       href: '/contacto'       },
  ],
  contactoTitulo: 'Contacto',
  direccion:  'Av. Don Bosco s/n, Cuenca, Ecuador',
  telefono1:  '+593 7 000 0000',
  telefono2:  '+593 7 000 0001',
  email:      'info@uets.edu.ec',
  mapaImagen: '',
  mapaUrl:    'https://maps.google.com',
  copyright:  `© ${new Date().getFullYear()} Unidad Educativa. Todos los derechos reservados.`,
  footerLinks: [
    { id: 1, label: 'Política de privacidad', href: '' },
    { id: 2, label: 'Términos de uso',        href: '' },
  ],
};

@Injectable({ providedIn: 'root' })
export class SiteFooterService {

  constructor(private configApi: ConfiguracionApiService) {}

  private cargarLocal(): SiteFooterConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }

  get(): SiteFooterConfig { return this.cargarLocal(); }

  getCopia(): SiteFooterConfig { return JSON.parse(JSON.stringify(this.get())); }

  guardar(c: SiteFooterConfig): Observable<void> {
    return this.configApi.guardar('site_footer', c).pipe(
      tap(() => localStorage.setItem(KEY, JSON.stringify(c))),
      catchError(() => {
        localStorage.setItem(KEY, JSON.stringify(c));
        return of(undefined as void);
      })
    );
  }

  cargarDesdeBackend(): Observable<SiteFooterConfig> {
    return this.configApi.get<SiteFooterConfig>('site_footer').pipe(
      map(c => ({
        ...DEFAULT,
        ...c,
        redes:       Array.isArray(c.redes)       && c.redes.length       ? c.redes       : DEFAULT.redes,
        quickLinks:  Array.isArray(c.quickLinks)  && c.quickLinks.length  ? c.quickLinks  : DEFAULT.quickLinks,
        footerLinks: Array.isArray(c.footerLinks) && c.footerLinks.length ? c.footerLinks : DEFAULT.footerLinks,
      })),
      tap(c => localStorage.setItem(KEY, JSON.stringify(c))),
      catchError(() => of(this.cargarLocal()))
    );
  }

  nextId(): number { return Date.now(); }
}

