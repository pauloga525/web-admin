import { Injectable } from '@angular/core';

export interface InstructivoCategoria { id: number; icon: string; name: string; }
export interface Instructivo {
  id:          number;
  title:       string;
  description: string;
  type:        'pdf' | 'video';
  categoria:   string;
  fecha:       string;
  url:         string;
  buttonText:  string;
}

export interface InstructivosConfig {
  heroTitulo:      string;
  heroDescripcion: string;
  soporteUrl:      string;
  categorias:      InstructivoCategoria[];
  instructivos:    Instructivo[];
}

const KEY = 'edu_instructivos';

const DEFAULT: InstructivosConfig = {
  heroTitulo:      'Instructivos y Tutoriales',
  heroDescripcion: 'Encuentra guías paso a paso, manuales en PDF y videotutoriales para dominar todas nuestras plataformas institucionales.',
  soporteUrl:      '/contacto',
  categorias: [
    { id: 1, icon: 'school',       name: 'Plataforma Educativa' },
    { id: 2, icon: 'computer',     name: 'Sistemas Informáticos' },
    { id: 3, icon: 'assignment',   name: 'Trámites y Secretaría' },
    { id: 4, icon: 'library_books',name: 'Biblioteca Digital'    },
  ],
  instructivos: [
    { id: 1, title: 'Cómo acceder al Aula Virtual',        description: 'Guía paso a paso para ingresar a la plataforma Moodle y navegar por tus cursos.',          type: 'pdf',   categoria: 'Plataforma Educativa',  fecha: '2024-01-15', url: '', buttonText: 'Descargar PDF'    },
    { id: 2, title: 'Tutorial: Entrega de tareas en Moodle', description: 'Aprende a subir y entregar tus actividades correctamente en la plataforma virtual.',       type: 'video', categoria: 'Plataforma Educativa',  fecha: '2024-01-20', url: '', buttonText: 'Ver Tutorial'     },
    { id: 3, title: 'Solicitud de certificados en línea',  description: 'Proceso para solicitar certificados de matrícula y notas desde el portal estudiantil.',      type: 'pdf',   categoria: 'Trámites y Secretaría', fecha: '2024-02-01', url: '', buttonText: 'Descargar PDF'    },
    { id: 4, title: 'Acceso a la Biblioteca Digital',      description: 'Cómo buscar y descargar libros y artículos desde el repositorio institucional.',             type: 'video', categoria: 'Biblioteca Digital',    fecha: '2024-02-10', url: '', buttonText: 'Ver Tutorial'     },
  ],
};

@Injectable({ providedIn: 'root' })
export class InstructivosService {
  get(): InstructivosConfig {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  }
  getCopia(): InstructivosConfig { return JSON.parse(JSON.stringify(this.get())); }
  guardar(c: InstructivosConfig): void { localStorage.setItem(KEY, JSON.stringify(c)); }
  nextId(): number { return Date.now(); }
}

