import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NivelConfig } from '../models/nivel.model';
import { ConfiguracionApiService } from './configuracion-api.service';

const CLAVE = (id: string) => `nivel_${id}`;

const DEFAULTS: Record<string, NivelConfig> = {
  preparatoria: {
    nivelId: 'preparatoria',
    heroImagenFondo: '',
    heroBadge: 'Académico',
    levelName: 'Preparatoria',
    levelDescription: 'Formamos la base del aprendizaje con amor, juego y descubrimiento.',
    sectionTitle: '¿Qué es la Preparatoria?',
    sectionDescription: 'La preparatoria es el primer nivel de educación formal donde los niños desarrollan habilidades cognitivas, sociales y emocionales fundamentales.',
    sectionExtra: 'Nuestro enfoque salesiano garantiza un ambiente seguro, afectuoso y estimulante para cada niño.',
    keyFacts: [
      { id: 1, icon: 'child_care',   title: 'Edad',       value: '3 a 5 años'       },
      { id: 2, icon: 'schedule',     title: 'Jornada',    value: 'Matutina'         },
      { id: 3, icon: 'groups',       title: 'Alumnos',    value: 'Máx. 20 por aula' },
      { id: 4, icon: 'emoji_events', title: 'Metodología', value: 'Juego-trabajo'  },
    ],
    curriculumHighlights: [
      { id: 1, icon: 'brush',      title: 'Arte y Creatividad',  description: 'Expresión libre a través del dibujo, pintura y manualidades.' },
      { id: 2, icon: 'music_note', title: 'Música y Movimiento', description: 'Desarrollo rítmico y coordinación motriz.' },
      { id: 3, icon: 'menu_book',  title: 'Pre-lectura',         description: 'Iniciación a la lectura y escritura de forma lúdica.' },
    ],
    subjects: [
      { id: 1, name: 'Lenguaje y Comunicación' },
      { id: 2, name: 'Lógico-Matemática'       },
      { id: 3, name: 'Ciencias Naturales'      },
      { id: 4, name: 'Educación Física'        },
      { id: 5, name: 'Expresión Artística'     },
    ],
    environmentTitle: 'Un ambiente diseñado para crecer',
    environmentDescription: 'Nuestras aulas están equipadas con rincones de aprendizaje, materiales Montessori y espacios verdes para el juego libre.',
    environmentImages: [],
    ctaDescripcion: 'Agenda una visita al campus o contáctanos para resolver todas tus dudas sobre este nivel.',
  },

  'basica-elemental': {
    nivelId: 'basica-elemental',
    heroImagenFondo: '',
    heroBadge: 'Académico',
    levelName: 'Básica Elemental',
    levelDescription: 'Construimos los cimientos del conocimiento con metodologías activas e innovadoras.',
    sectionTitle: '¿Qué es la Básica Elemental?',
    sectionDescription: 'Comprende los primeros años de educación básica (1°, 2° y 3° grado), donde se consolidan la lectura, escritura y pensamiento matemático.',
    sectionExtra: 'Trabajamos con proyectos interdisciplinarios que conectan el aprendizaje con la vida cotidiana.',
    keyFacts: [
      { id: 1, icon: 'school',   title: 'Grados',  value: '1° a 3° EGB'        },
      { id: 2, icon: 'schedule', title: 'Jornada', value: 'Matutina'           },
      { id: 3, icon: 'groups',   title: 'Alumnos', value: 'Máx. 25 por aula'  },
      { id: 4, icon: 'star',     title: 'Enfoque', value: 'Aprendizaje activo' },
    ],
    curriculumHighlights: [
      { id: 1, icon: 'menu_book', title: 'Lectoescritura', description: 'Consolidación de la lectura comprensiva y escritura creativa.' },
      { id: 2, icon: 'calculate', title: 'Matemática',     description: 'Pensamiento lógico y resolución de problemas.' },
      { id: 3, icon: 'language',  title: 'Inglés Inicial', description: 'Introducción al idioma inglés de forma lúdica.' },
    ],
    subjects: [
      { id: 1, name: 'Lengua y Literatura'             },
      { id: 2, name: 'Matemática'                      },
      { id: 3, name: 'Ciencias Naturales'              },
      { id: 4, name: 'Estudios Sociales'               },
      { id: 5, name: 'Inglés'                          },
      { id: 6, name: 'Educación Física'                },
      { id: 7, name: 'Educación Cultural y Artística'  },
    ],
    environmentTitle: 'Espacios que inspiran el aprendizaje',
    environmentDescription: 'Aulas luminosas, biblioteca infantil y laboratorio de computación adaptado para los más pequeños.',
    environmentImages: [],
    ctaDescripcion: 'Agenda una visita al campus o contáctanos para resolver todas tus dudas sobre este nivel.',
  },

  'basica-media': {
    nivelId: 'basica-media',
    heroImagenFondo: '',
    heroBadge: 'Académico',
    levelName: 'Básica Media',
    levelDescription: 'Fortalecemos el pensamiento crítico y la autonomía en el aprendizaje.',
    sectionTitle: '¿Qué es la Básica Media?',
    sectionDescription: 'Abarca los grados 4°, 5° y 6° de educación básica, donde los estudiantes profundizan en todas las áreas del conocimiento.',
    sectionExtra: 'Incorporamos tecnología educativa y proyectos de investigación para desarrollar habilidades del siglo XXI.',
    keyFacts: [
      { id: 1, icon: 'school',   title: 'Grados',      value: '4° a 6° EGB'     },
      { id: 2, icon: 'schedule', title: 'Jornada',     value: 'Matutina'        },
      { id: 3, icon: 'groups',   title: 'Alumnos',     value: 'Máx. 28 por aula' },
      { id: 4, icon: 'devices',  title: 'Tecnología',  value: 'Aulas digitales' },
    ],
    curriculumHighlights: [
      { id: 1, icon: 'science', title: 'Ciencias',          description: 'Experimentos y proyectos científicos aplicados.' },
      { id: 2, icon: 'public',  title: 'Estudios Sociales', description: 'Historia, geografía y ciudadanía activa.' },
      { id: 3, icon: 'computer',title: 'Tecnología',        description: 'Programación básica y uso responsable de internet.' },
    ],
    subjects: [
      { id: 1, name: 'Lengua y Literatura'            },
      { id: 2, name: 'Matemática'                     },
      { id: 3, name: 'Ciencias Naturales'             },
      { id: 4, name: 'Estudios Sociales'              },
      { id: 5, name: 'Inglés'                         },
      { id: 6, name: 'Educación Física'               },
      { id: 7, name: 'Tecnología'                     },
      { id: 8, name: 'Educación Cultural y Artística' },
    ],
    environmentTitle: 'Tecnología al servicio del aprendizaje',
    environmentDescription: 'Laboratorios de ciencias, aulas digitales interactivas y espacios de trabajo colaborativo.',
    environmentImages: [],
    ctaDescripcion: 'Agenda una visita al campus o contáctanos para resolver todas tus dudas sobre este nivel.',
  },

  'basica-superior': {
    nivelId: 'basica-superior',
    heroImagenFondo: '',
    heroBadge: 'Académico',
    levelName: 'Básica Superior',
    levelDescription: 'Preparamos a nuestros estudiantes para los desafíos del bachillerato con excelencia académica.',
    sectionTitle: '¿Qué es la Básica Superior?',
    sectionDescription: 'Comprende los grados 7°, 8° y 9° de educación básica, el puente hacia el bachillerato.',
    sectionExtra: 'Desarrollamos competencias investigativas, liderazgo y pensamiento crítico para la vida.',
    keyFacts: [
      { id: 1, icon: 'school',       title: 'Grados',  value: '7° a 9° EGB'              },
      { id: 2, icon: 'schedule',     title: 'Jornada', value: 'Matutina'                 },
      { id: 3, icon: 'groups',       title: 'Alumnos', value: 'Máx. 30 por aula'         },
      { id: 4, icon: 'trending_up',  title: 'Enfoque', value: 'Preparación bachillerato' },
    ],
    curriculumHighlights: [
      { id: 1, icon: 'biotech',    title: 'Ciencias Avanzadas',  description: 'Física, química y biología con laboratorio propio.' },
      { id: 2, icon: 'calculate',  title: 'Matemática Avanzada', description: 'Álgebra, geometría y estadística.' },
      { id: 3, icon: 'translate',  title: 'Inglés Avanzado',     description: 'Preparación para certificaciones internacionales.' },
    ],
    subjects: [
      { id: 1, name: 'Lengua y Literatura'            },
      { id: 2, name: 'Matemática'                     },
      { id: 3, name: 'Ciencias Naturales'             },
      { id: 4, name: 'Estudios Sociales'              },
      { id: 5, name: 'Inglés'                         },
      { id: 6, name: 'Educación Física'               },
      { id: 7, name: 'Tecnología'                     },
      { id: 8, name: 'Educación Cultural y Artística' },
      { id: 9, name: 'Emprendimiento'                 },
    ],
    environmentTitle: 'Preparados para el siguiente nivel',
    environmentDescription: 'Biblioteca especializada, laboratorios equipados y orientación vocacional para la transición al bachillerato.',
    environmentImages: [],
    ctaDescripcion: 'Agenda una visita al campus o contáctanos para resolver todas tus dudas sobre este nivel.',
  },
};

@Injectable({ providedIn: 'root' })
export class NivelService {

  constructor(private configApi: ConfiguracionApiService) {}

  get(nivelId: string): Observable<NivelConfig> {
    const def = DEFAULTS[nivelId] ?? DEFAULTS['preparatoria'];
    return this.configApi.get<any>(CLAVE(nivelId)).pipe(
      map(data => this.mergeConDefault(def, data)),
      catchError(() => of({ ...def })),
    );
  }

  /**
   * Combina lo guardado con los valores por defecto de ese nivel, y migra
   * el campo viejo 'environmentImagen' (una sola imagen, string) a
   * 'environmentImages' (arreglo) si el documento todavía no tiene el
   * campo nuevo — para no perder una imagen que ya estaba cargada.
   */
  private mergeConDefault(def: NivelConfig, data: any): NivelConfig {
    if (!data || !Object.keys(data).length) return { ...def };
    const merged: NivelConfig = { ...def, ...data };
    if (!Array.isArray(merged.environmentImages) || !merged.environmentImages.length) {
      merged.environmentImages = (typeof data.environmentImagen === 'string' && data.environmentImagen)
        ? [data.environmentImagen]
        : [...def.environmentImages];
    }
    return merged;
  }

  guardar(config: NivelConfig): Observable<void> {
    return this.configApi.guardar<NivelConfig>(CLAVE(config.nivelId), config);
  }

  nextId(): number { return Date.now(); }
}
