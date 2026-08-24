/**
 * @file dashboard.ts
 * @description Panel principal — KPIs + Editor de contenido del Home.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Subscription, lastValueFrom } from 'rxjs';

import { ActivityService } from '../../services/activity';
import { HomeService }     from '../../services/home.service';
import { EventoService }   from '../../services/evento.service';
import { KpiService, KpiCard } from '../../services/kpi.service';
import { ImageUrlInputComponent } from '../../components/image-url-input/image-url-input.component';
import { environment } from '../../../environments/environment';

import {
  Actividad, GrupoActividad,
  HomeConfig, HomeBoton, HomePorQueItem, HomeNivel,
  HomeLogo, HomeCaracteristica, HomeEnlace, HomeFooterColumna,
} from '../../models';

interface SeccionNav { id: string; label: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ImageUrlInputComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  // ─── KPIs ──────────────────────────────────────────────────────────────────
  kpis: KpiCard[] = [];
  editandoKpi: KpiCard | null = null;
  guardadoKpis = false;
  private kpiTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Actividad reciente ────────────────────────────────────────────────────
  actividades: Actividad[] = [];

  // ─── Home editor ──────────────────────────────────────────────────────────
  home!: HomeConfig;
  guardadoHome = false;
  errorHome: string | null = null;
  seccionActiva = 'hero';

  secciones: SeccionNav[] = [
    { id: 'hero',          label: 'Hero'              },
    { id: 'estadisticas',  label: 'Estadísticas'      },
    { id: 'contenido',     label: 'Contenido'         },  // porQue + niveles
    { id: 'eventosLogos',  label: 'Eventos & Logos'   },  // eventos home + logos
    { id: 'institucional', label: 'Institucional'     },  // institucional + comunicacion
    { id: 'admisiones',    label: 'Admisiones'        },  // admisiones + enlacesInteres
    { id: 'footer',        label: 'Footer'            },
  ];

  private subs = new Subscription();
  private guardadoTimer: ReturnType<typeof setTimeout> | null = null;

  heroUploading = false;

  constructor(
    public activityService: ActivityService,
    private homeService: HomeService,
    private eventoService: EventoService,
    private kpiService: KpiService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {}

  // ─── Hero media ────────────────────────────────────────────────────────────
  heroSafeVideoUrl: SafeUrl | null = null;
  heroMediaError: string | null = null;

  get heroEsVideo(): boolean {
    return this.home?.hero?.mediaType === 'video' ||
           (this.home?.hero?.imagenFondo?.startsWith('data:video/') ?? false);
  }

  private actualizarHeroSafeVideoUrl(): void {
    const src = this.home?.hero?.imagenFondo ?? '';
    this.heroSafeVideoUrl = (src && this.heroEsVideo)
      ? this.sanitizer.bypassSecurityTrustUrl(src)
      : null;
  }

  onHeroMediaSelect(event: Event): void {
    this.heroMediaError = null;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      this.heroMediaError = 'Los videos no pueden subirse como archivo. Usa una URL externa (YouTube embed, CDN, etc.) pegándola en el campo de texto.';
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.heroMediaError = 'Formato no soportado. Usa imágenes (JPG, PNG, WebP).';
      input.value = '';
      return;
    }

    this.heroUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    lastValueFrom(
      this.http.post<{ url: string }>(`${environment.apiUrl}/configuracion/imagenes`, formData)
    ).then(res => {
      if (!res?.url) throw new Error('Sin URL');
      this.home.hero.imagenFondo = res.url;
      this.home.hero.mediaType = 'image';
      this.actualizarHeroSafeVideoUrl();
      this.onCambioHome();
    }).catch(() => {
      this.heroMediaError = 'No se pudo subir la imagen. Verifica que el backend esté activo.';
    }).finally(() => {
      this.heroUploading = false;
      input.value = '';
    });
  }

  removeHeroMedia(): void {
    this.home.hero.imagenFondo = '';
    this.home.hero.mediaType = undefined;
    this.heroSafeVideoUrl = null;
    this.onCambioHome();
  }

  private homeEditando = false;

  ngOnInit(): void {
    this.kpis = this.kpiService.getCopia();
    this.actividades = this.activityService.getActividadesRecientes();

    // Suscripción reactiva: actualiza this.home cuando llega la respuesta del backend
    // (evita mostrar datos vacíos mientras el HTTP GET termina)
    this.subs.add(
      this.homeService.config$.subscribe(config => {
        if (!this.homeEditando) {
          this.home = JSON.parse(JSON.stringify(config));
          this.actualizarHeroSafeVideoUrl();
        }
      })
    );

    this.subs.add(
      this.eventoService.eventos$.subscribe(evs => {
        const count = evs.filter(e => e.publicado).length;
        const eventoKpi = this.kpis.find(k => k.id === 'eventos');
        if (eventoKpi) eventoKpi.value = String(count);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.guardadoTimer) clearTimeout(this.guardadoTimer);
    if (this.kpiTimer) clearTimeout(this.kpiTimer);
  }

  // ─── KPIs ──────────────────────────────────────────────────────────────────
  guardarKpis(): void {
    this.kpiService.guardar(this.kpis);
    this.editandoKpi = null;
    this.guardadoKpis = true;
    if (this.kpiTimer) clearTimeout(this.kpiTimer);
    this.kpiTimer = setTimeout(() => this.guardadoKpis = false, 3000);
  }

  // ─── Actividad ─────────────────────────────────────────────────────────────

  /** Retorna grupos con máximo 6 actividades en total para el widget del dashboard. */
  getActividadesAgrupadas(): GrupoActividad[] {
    const grupos = this.activityService.getActividadesAgrupadas();
    let restantes = 6;
    const resultado: GrupoActividad[] = [];
    for (const g of grupos) {
      if (restantes <= 0) break;
      const items = g.items.slice(0, restantes);
      resultado.push({ titulo: g.titulo, items });
      restantes -= items.length;
    }
    return resultado;
  }

  isNuevaActividad(a: Actividad): boolean {
    return this.activityService.isNuevaActividad(a);
  }

  // ─── Home ──────────────────────────────────────────────────────────────────
  onCambioHome(): void {
    this.guardadoHome = false;
    this.homeEditando = true;
  }

  guardarHome(): void {
    this.errorHome = null;
    this.subs.add(
      this.homeService.guardar(this.home).subscribe({
        next: () => {
          this.homeEditando = false;
          this.guardadoHome = true;
          if (this.guardadoTimer) clearTimeout(this.guardadoTimer);
          this.guardadoTimer = setTimeout(() => { this.guardadoHome = false; }, 3000);
        },
        error: (err) => {
          console.error('❌ Error al guardar home:', err);
          if (err?.status === 401) {
            this.errorHome = 'Sesión expirada. Por favor, vuelve a iniciar sesión.';
          } else if (err?.status === 413) {
            this.errorHome = 'El contenido es demasiado grande para guardar. Reduce el tamaño de las imágenes o usa URLs externas en lugar de archivos subidos.';
          } else {
            this.errorHome = `Error al guardar: ${err?.status ?? 'desconocido'}`;
          }
        }
      })
    );
  }

  trackById(_i: number, item: { id: number }): number { return item.id; }

  // ── Hero ───────────────────────────────────────────────────────────────────
  agregarBotonHero(): void {
    this.home.hero.botones.push({ id: this.homeService.nextId(), label: '', url: '', estilo: 'primary' });
    this.onCambioHome();
  }
  eliminarBotonHero(id: number): void {
    this.home.hero.botones = this.home.hero.botones.filter(b => b.id !== id);
    this.onCambioHome();
  }

  // ── Estadísticas ───────────────────────────────────────────────────────────
  agregarEstadistica(): void {
    this.home.estadisticas.push({ id: this.homeService.nextId(), valor: '', etiqueta: '' });
    this.onCambioHome();
  }
  eliminarEstadistica(id: number): void {
    this.home.estadisticas = this.home.estadisticas.filter(s => s.id !== id);
    this.onCambioHome();
  }

  // ── Por qué ────────────────────────────────────────────────────────────────
  agregarPorQue(): void {
    this.home.porQue.push({ id: this.homeService.nextId(), icono: '', titulo: '', descripcion: '' });
    this.onCambioHome();
  }
  eliminarPorQue(id: number): void {
    this.home.porQue = this.home.porQue.filter(p => p.id !== id);
    this.onCambioHome();
  }

  // ── Niveles ────────────────────────────────────────────────────────────────
  agregarNivel(): void {
    this.home.niveles.push({ id: this.homeService.nextId(), imagen: '', nombre: '', descripcion: '', enlace: '' });
    this.onCambioHome();
  }
  eliminarNivel(id: number): void {
    this.home.niveles = this.home.niveles.filter(n => n.id !== id);
    this.onCambioHome();
  }

  // ── Logos ──────────────────────────────────────────────────────────────────
  agregarLogo(): void {
    this.home.logos.push({ id: this.homeService.nextId(), url: '', nombre: '' });
    this.onCambioHome();
  }
  eliminarLogo(id: number): void {
    this.home.logos = this.home.logos.filter(l => l.id !== id);
    this.onCambioHome();
  }

  // ── Institucional ──────────────────────────────────────────────────────────
  agregarCaracteristica(): void {
    this.home.institucional.caracteristicas.push({ id: this.homeService.nextId(), texto: '' });
    this.onCambioHome();
  }
  eliminarCaracteristica(id: number): void {
    this.home.institucional.caracteristicas = this.home.institucional.caracteristicas.filter(c => c.id !== id);
    this.onCambioHome();
  }

  // ── Comunicación ───────────────────────────────────────────────────────────
  agregarComunicacion(): void {
    this.home.comunicacion.push({ id: this.homeService.nextId(), nombre: '', url: '', imagen: '' });
    this.onCambioHome();
  }
  eliminarComunicacion(id: number): void {
    this.home.comunicacion = this.home.comunicacion.filter(e => e.id !== id);
    this.onCambioHome();
  }

  // ── Admisiones ─────────────────────────────────────────────────────────────
  agregarEnlaceAdmision(): void {
    this.home.admisiones.enlaces.push({ id: this.homeService.nextId(), nombre: '', url: '' });
    this.onCambioHome();
  }
  eliminarEnlaceAdmision(id: number): void {
    this.home.admisiones.enlaces = this.home.admisiones.enlaces.filter(e => e.id !== id);
    this.onCambioHome();
  }

  // ── Enlaces de interés ─────────────────────────────────────────────────────
  agregarEnlaceInteres(): void {
    this.home.enlacesInteres.push({ id: this.homeService.nextId(), nombre: '', url: '', imagen: '' });
    this.onCambioHome();
  }
  eliminarEnlaceInteres(id: number): void {
    this.home.enlacesInteres = this.home.enlacesInteres.filter(e => e.id !== id);
    this.onCambioHome();
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  agregarColumnaFooter(): void {
    this.home.footer.columnas.push({ titulo: '', enlaces: [] });
    this.onCambioHome();
  }
  eliminarColumnaFooter(i: number): void {
    this.home.footer.columnas.splice(i, 1);
    this.onCambioHome();
  }
  agregarEnlaceFooter(col: HomeFooterColumna): void {
    col.enlaces.push({ id: this.homeService.nextId(), nombre: '', url: '' });
    this.onCambioHome();
  }
  eliminarEnlaceFooter(col: HomeFooterColumna, id: number): void {
    col.enlaces = col.enlaces.filter(e => e.id !== id);
    this.onCambioHome();
  }
}
