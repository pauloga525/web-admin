/**
 * @file uniformes.service.ts
 * @description Gestiona la configuración de página (hero, tarjetas) de "Uniformes".
 * Persiste en el backend (clave: 'uniformes_page') con fallback a localStorage.
 * Los uniformes en sí se gestionan como /uniformes, ver UniformesApiService.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface CaracteristicaUniforme {
  id:          number;
  titulo:      string;
  descripcion: string;
}

export interface UniformesConfig {
  // Hero
  heroTitulo:      string;
  heroDescripcion: string;
  heroImagen:      string;
  // Info cards (los 3 bloques de estadísticas)
  card1Titulo:     string;
  card1Desc:       string;
  card2Titulo:     string;
  card2Desc:       string;
  card3Valor:      string;
  card3Titulo:     string;
  card3Desc:       string;
  // Sección "Características" (los 6 bloques con check al final de la página)
  caracteristicas: CaracteristicaUniforme[];
}

const KEY = 'edu_uniformes_page';

const DEFAULT: UniformesConfig = {
  heroTitulo:      'Uniformes Escolares',
  heroDescripcion: 'Visualiza nuestros uniformes escolares con todas las características y detalles',
  heroImagen:      '',
  card1Titulo:     'Tipos de Uniformes',
  card1Desc:       'Opciones para todos los niveles educativos',
  card2Titulo:     'Categorías',
  card2Desc:       'Diario, deportivo, ceremonia y más',
  card3Valor:      '100%',
  card3Titulo:     'Calidad Garantizada',
  card3Desc:       'Tela de primera calidad y durabilidad',
  caracteristicas: [
    { id: 1, titulo: 'Tela de Calidad',        descripcion: 'Material transpirable y duradero para máximo confort' },
    { id: 2, titulo: 'Diseño Moderno',         descripcion: 'Estilos actuales que reflejan la identidad institucional' },
    { id: 3, titulo: 'Variedad de Tallas',     descripcion: 'Disponible en todas las tallas desde XS hasta XXL' },
    { id: 4, titulo: 'Bordado Institucional',  descripcion: 'Logo y distintivos bordados con precisión' },
    { id: 5, titulo: 'Fácil de Limpiar',       descripcion: 'Resistente al lavado frecuente sin decolorarse' },
    { id: 6, titulo: 'Garantía de Calidad',    descripcion: 'Respaldado por garantía de satisfacción institucional' },
  ],
};

@Injectable({ providedIn: 'root' })
export class UniformesService {

  private subject = new BehaviorSubject<UniformesConfig>(this.clone(DEFAULT));
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<UniformesConfig>>('uniformes_page').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(err => of(err?.status === 404 ? this.clone(DEFAULT) : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c));
  }

  /**
   * Combina lo que venga del backend con DEFAULT — necesario porque un documento
   * guardado antes de agregar un campo nuevo (ej. 'caracteristicas') no lo tendrá,
   * y sin este merge llegaría como `undefined` y rompería cualquier `.length`/`.push`.
   */
  private mergeConDefault(c?: Partial<UniformesConfig> | null): UniformesConfig {
    return {
      ...this.clone(DEFAULT),
      ...(c ?? {}),
      caracteristicas: c?.caracteristicas ?? this.clone(DEFAULT.caracteristicas),
    };
  }

  private cargarLocal(): UniformesConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? this.mergeConDefault(JSON.parse(raw)) : this.clone(DEFAULT);
    } catch { return this.clone(DEFAULT); }
  }

  get(): UniformesConfig { return this.subject.value; }
  getCopia(): UniformesConfig { return this.clone(this.subject.value); }

  guardar(c: UniformesConfig): Observable<void> {
    return this.configApi.guardar('uniformes_page', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<UniformesConfig> {
    return this.configApi.get<Partial<UniformesConfig>>('uniformes_page').pipe(
      map(c => this.mergeConDefault(c)),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
