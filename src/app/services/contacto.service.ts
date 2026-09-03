/**
 * @file contacto.service.ts
 * @description Gestiona el contenido de la página pública "Contacto".
 * Persiste en el backend (clave: 'contacto') con fallback a localStorage.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface ContactoAsunto {
  id:            number;
  label:         string;   // lo que ve el usuario en el select
  emailDestino:  string;   // correo al que se envía el mensaje
}

export interface ContactoInfo {
  id:      number;
  icon:    string;         // material icon name
  title:   string;
  details: string[];       // líneas de detalle
  extra?:  string;         // texto secundario opcional
}

export interface ContactoRed {
  id:      number;
  nombre:  string;
  url:     string;
  red:     'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
}

export interface ContactoConfig {
  // Hero
  heroTitulo:      string;
  heroDescripcion: string;
  // Mapa
  mapImageUrl:     string;
  mapLinkUrl:      string;
  // Info de contacto
  infoCards:       ContactoInfo[];
  // Redes sociales
  redes:           ContactoRed[];
  // Formulario
  formTitulo:      string;
  formDescripcion: string;
  formBotonLabel:  string;
  asuntos:         ContactoAsunto[];
}

const KEY = 'edu_contacto';

const DEFAULT: ContactoConfig = {
  heroTitulo:      'Ponte en contacto',
  heroDescripcion: 'Estamos aquí para resolver tus dudas y apoyarte en tu proceso académico. Envíanos un mensaje o visítanos en nuestro campus.',
  mapImageUrl:     '',
  mapLinkUrl:      'https://maps.google.com',
  infoCards: [
    { id: 1, icon: 'location_on',  title: 'Dirección',          details: ['Av. Don Bosco s/n, Cuenca, Ecuador'],          extra: 'Campus Principal UETS' },
    { id: 2, icon: 'phone',        title: 'Teléfono',           details: ['+593 7 000 0000', '+593 7 000 0001'],           extra: 'Lun – Vie: 07:00 – 17:00' },
    { id: 3, icon: 'email',        title: 'Correo electrónico', details: ['info@uets.edu.ec'],                             extra: 'Respondemos en 24 horas' },
    { id: 4, icon: 'schedule',     title: 'Horario de atención', details: ['Lunes a Viernes: 07:00 – 17:00'],             extra: 'Sábados: 08:00 – 12:00' },
  ],
  redes: [
    { id: 1, nombre: 'Facebook',  url: 'https://facebook.com',  red: 'facebook'  },
    { id: 2, nombre: 'Twitter',   url: 'https://twitter.com',   red: 'twitter'   },
    { id: 3, nombre: 'Instagram', url: 'https://instagram.com', red: 'instagram' },
    { id: 4, nombre: 'LinkedIn',  url: 'https://linkedin.com',  red: 'linkedin'  },
  ],
  formTitulo:      'Envíanos un mensaje',
  formDescripcion: 'Completa el formulario y nos pondremos en contacto contigo lo antes posible.',
  formBotonLabel:  'Enviar mensaje',
  asuntos: [
    { id: 1, label: 'Información general',  emailDestino: 'info@uets.edu.ec'        },
    { id: 2, label: 'Admisiones',           emailDestino: 'admisiones@uets.edu.ec'  },
    { id: 3, label: 'Secretaría',           emailDestino: 'secretaria@uets.edu.ec'  },
    { id: 4, label: 'Psicología',           emailDestino: 'psicologia@uets.edu.ec'  },
    { id: 5, label: 'Coordinación académica', emailDestino: 'coordinacion@uets.edu.ec' },
  ],
};

@Injectable({ providedIn: 'root' })
export class ContactoService {

  private subject = new BehaviorSubject<ContactoConfig>(this.clone(DEFAULT));
  config$ = this.subject.asObservable();

  constructor(private configApi: ConfiguracionApiService) {
    this.configApi.get<Partial<ContactoConfig>>('contacto').pipe(
      map(c => this.mergeConDefault(c)),
      catchError(err => of(err?.status === 404 ? this.clone(DEFAULT) : this.cargarLocal()))
    ).subscribe(c => this.subject.next(c));
  }

  /**
   * Combina lo que venga del backend con DEFAULT — necesario porque
   * ConfiguracionApiService.get() convierte un 404 en {} (objeto vacío) en
   * vez de lanzar error, y un documento guardado antes de agregar un campo
   * nuevo tampoco lo tendrá. Sin este merge, los arrays (infoCards, redes,
   * asuntos) llegan como undefined y rompen el editor (.push is not a
   * function) o se pierden por completo al volver a guardar.
   */
  private mergeConDefault(c?: Partial<ContactoConfig> | null): ContactoConfig {
    return {
      ...this.clone(DEFAULT),
      ...(c ?? {}),
      infoCards: c?.infoCards ?? this.clone(DEFAULT.infoCards),
      redes: c?.redes ?? this.clone(DEFAULT.redes),
      asuntos: c?.asuntos ?? this.clone(DEFAULT.asuntos),
    };
  }

  private cargarLocal(): ContactoConfig {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? this.mergeConDefault(JSON.parse(raw)) : this.clone(DEFAULT);
    } catch { return this.clone(DEFAULT); }
  }

  get(): ContactoConfig { return this.subject.value; }
  getCopia(): ContactoConfig { return this.clone(this.subject.value); }

  guardar(c: ContactoConfig): Observable<void> {
    return this.configApi.guardar('contacto', c).pipe(
      tap(() => this.subject.next(c))
    );
  }

  cargarDesdeBackend(): Observable<ContactoConfig> {
    return this.configApi.get<Partial<ContactoConfig>>('contacto').pipe(
      map(c => this.mergeConDefault(c)),
      tap(c => this.subject.next(c)),
      catchError(() => of(this.subject.value))
    );
  }

  nextId(): number { return Date.now(); }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
