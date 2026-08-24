/**
 * @file evento.service.ts
 * @description Servicio de eventos conectado al backend NestJS.
 * Mantiene la misma API pública que la versión localStorage.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Evento, CreateEventoDto, EventosPaginados,
  CategoriaEvento, HeroEventos,
} from '../models/api.models';

const CATEGORIAS_DEFAULT: CategoriaEvento[] = [
  { id: 1, nombre: 'Académico', color: 'blue' },
  { id: 2, nombre: 'Cultural', color: 'yellow' },
  { id: 3, nombre: 'Pastoral', color: 'green' },
  { id: 4, nombre: 'Deportes', color: 'red' },
  { id: 5, nombre: 'Comunidad', color: 'purple' },
];

export interface FiltroEventos {
  q?: string;
  categoria?: string;
  mes?: number;
  anio?: number;
  pagina?: number;
  porPagina?: number;
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly apiUrl = `${environment.apiUrl}/eventos`;
  private readonly configUrl = `${environment.apiUrl}/configuracion`;

  private eventosSubject    = new BehaviorSubject<Evento[]>([]);
  private categoriasSubject = new BehaviorSubject<CategoriaEvento[]>([]);
  private heroSubject       = new BehaviorSubject<HeroEventos>({
    etiqueta: '', titulo: '', subtitulo: '', imagenFondo: '',
  });

  eventos$    = this.eventosSubject.asObservable();
  categorias$ = this.categoriasSubject.asObservable();
  hero$       = this.heroSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarTodos();
    this.cargarCategorias();
    this.cargarHero();
  }

  // ─── Carga ────────────────────────────────────────────────────────────────

  cargarTodos(): void {
    this.http.get<Evento[]>(this.apiUrl).subscribe({
      next:  lista => this.eventosSubject.next(lista),
      error: err   => console.error('[EventoService] Error al cargar eventos:', err),
    });
  }

  private cargarCategorias(): void {
    this.http.get<{ clave: string; datos: { categorias: CategoriaEvento[] } }>(
      `${this.configUrl}/eventos_categorias`
    ).subscribe({
      next:  res  => {
        const categorias = res.datos?.categorias?.length ? res.datos.categorias : CATEGORIAS_DEFAULT;
        this.categoriasSubject.next(categorias);
      },
      error: ()   => this.categoriasSubject.next(CATEGORIAS_DEFAULT),
    });
  }

  private cargarHero(): void {
    this.http.get<{ clave: string; datos: HeroEventos }>(
      `${this.configUrl}/eventos_hero`
    ).subscribe({
      next:  res => this.heroSubject.next(res.datos),
      error: ()  => {},
    });
  }

  // ─── Consultas ────────────────────────────────────────────────────────────

  getAll(): Evento[] { return this.eventosSubject.value; }

  getById(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/slug/${slug}`);
  }

  getDestacado(): Observable<Evento | null> {
    return this.http.get<Evento>(`${this.apiUrl}/destacado`);
  }

  filtrar(params: FiltroEventos): Observable<EventosPaginados> {
    let p = new HttpParams();
    if (params.q)         p = p.set('q', params.q);
    if (params.categoria) p = p.set('categoria', params.categoria);
    if (params.mes)       p = p.set('mes', params.mes);
    if (params.anio)      p = p.set('anio', params.anio);
    if (params.pagina)    p = p.set('pagina', params.pagina);
    if (params.porPagina) p = p.set('porPagina', params.porPagina);
    return this.http.get<EventosPaginados>(`${this.apiUrl}/publicos`, { params: p });
  }

  getCategorias(): CategoriaEvento[] { return this.categoriasSubject.value; }
  getHero(): HeroEventos { return this.heroSubject.value; }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  agregar(datos: CreateEventoDto): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, datos).pipe(
      tap(() => this.cargarTodos()),
    );
  }

  actualizar(evento: Evento): Observable<Evento> {
    const { _id, createdAt, updatedAt, ...body } = evento;
    return this.http.put<Evento>(`${this.apiUrl}/${_id}`, body).pipe(
      tap(() => this.cargarTodos()),
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarTodos()),
    );
  }

  setDestacado(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/destacado`, {}).pipe(
      tap(() => this.cargarTodos()),
    );
  }

  togglePublicado(id: string): Observable<Evento> {
    return this.http.patch<Evento>(`${this.apiUrl}/${id}/toggle-publicado`, {}).pipe(
      tap(() => this.cargarTodos()),
    );
  }

  // ─── Categorías (guardadas en configuracion) ──────────────────────────────

  agregarCategoria(datos: Omit<CategoriaEvento, 'id'>): void {
    const lista = [...this.getCategorias(), { ...datos, id: Date.now() }];
    this._guardarCategorias(lista);
  }

  actualizarCategoria(cat: CategoriaEvento): void {
    const lista = this.getCategorias().map(c => c.id === cat.id ? cat : c);
    this._guardarCategorias(lista);
  }

  eliminarCategoria(id: number): void {
    const lista = this.getCategorias().filter(c => c.id !== id);
    this._guardarCategorias(lista);
  }

  private _guardarCategorias(lista: CategoriaEvento[]): void {
    this.http.put(`${this.configUrl}/eventos_categorias`, { datos: { categorias: lista } })
      .subscribe(() => this.categoriasSubject.next(lista));
  }

  // ─── Hero ─────────────────────────────────────────────────────────────────

  actualizarHero(hero: HeroEventos): void {
    this.http.put(`${this.configUrl}/eventos_hero`, { datos: hero })
      .subscribe(() => this.heroSubject.next(hero));
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  generarSlug(titulo: string): string {
    return titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }
}
