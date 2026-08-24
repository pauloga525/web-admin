/**
 * @file app.routes.ts
 * @description Configuración de rutas de la aplicación.
 * Todas las rutas del panel están protegidas por authGuard.
 */
import { Routes } from '@angular/router';

import { Login }               from './pages/login/login';
import { Dashboard }           from './pages/dashboard/dashboard';
import { HeaderEditor }        from './pages/header-editor/header-editor';
import { FooterEditor }        from './pages/footer-editor/footer-editor';
import { Admisiones }          from './pages/admisiones/admisiones';
import { Noticias }            from './pages/noticias/noticias';
import { Contacto }            from './pages/contacto/contacto';
import { Preparatoria }        from './pages/preparatoria/preparatoria';
import { BasicaElemental }     from './pages/basica-elemental/basica-elemental';
import { BasicaMedia }         from './pages/basica-media/basica-media';
import { BasicaSuperior }      from './pages/basica-superior/basica-superior';
import { Especialidades }      from './pages/especialidades/especialidades';
import { EspecialidadEditor }  from './pages/especialidades/especialidad-editor/especialidad-editor';
import { Nosotros }            from './pages/nosotros/nosotros';
import { Autoridades }         from './pages/autoridades/autoridades';
import { Eventos }             from './pages/eventos/eventos';
import { EventoEditor }        from './pages/eventos/evento-editor/evento-editor';
import { Campus }              from './pages/campus/campus';
import { Estudiantes }         from './pages/estudiantes/estudiantes';
import { ConsejoEstudiantil }  from './pages/consejo-estudiantil/consejo-estudiantil';
import { Uniformes }           from './pages/uniformes/uniformes';
import { Biblioteca }          from './pages/biblioteca/biblioteca';
import { Instructivos }        from './pages/instructivos/instructivos';
import { Repositorios }        from './pages/repositorios/repositorios';
import { Configuracion }       from './pages/configuracion/configuracion';
import { Actividad }           from './pages/actividad/actividad';
import { authGuard }           from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },

  { path: '',                    canActivate: [authGuard], component: Dashboard,          data: { animation: 'Dashboard',           breadcrumb: 'Panel Principal'       } },
  { path: 'header',              canActivate: [authGuard], component: HeaderEditor,       data: { animation: 'HeaderEditor',        breadcrumb: 'Header del sitio'      } },
  { path: 'footer',              canActivate: [authGuard], component: FooterEditor,       data: { animation: 'FooterEditor',        breadcrumb: 'Footer del sitio'      } },
  { path: 'admisiones',          canActivate: [authGuard], component: Admisiones,         data: { animation: 'Admisiones',          breadcrumb: 'Admisiones'            } },
  { path: 'noticias',            canActivate: [authGuard], component: Noticias,           data: { animation: 'Noticias',            breadcrumb: 'Noticias'              } },
  { path: 'contacto',            canActivate: [authGuard], component: Contacto,           data: { animation: 'Contacto',            breadcrumb: 'Contacto'              } },
  { path: 'preparatoria',        canActivate: [authGuard], component: Preparatoria,       data: { animation: 'Preparatoria',        breadcrumb: 'Preparatoria'          } },
  { path: 'basica-elemental',    canActivate: [authGuard], component: BasicaElemental,    data: { animation: 'BasicaElemental',     breadcrumb: 'Básica Elemental'      } },
  { path: 'basica-media',        canActivate: [authGuard], component: BasicaMedia,        data: { animation: 'BasicaMedia',         breadcrumb: 'Básica Media'          } },
  { path: 'basica-superior',     canActivate: [authGuard], component: BasicaSuperior,     data: { animation: 'BasicaSuperior',      breadcrumb: 'Básica Superior'       } },
  { path: 'especialidades',      canActivate: [authGuard], component: Especialidades,     data: { animation: 'Especialidades',      breadcrumb: 'Bachillerato'          } },
  { path: 'especialidades/:id',  canActivate: [authGuard], component: EspecialidadEditor, data: { animation: 'EspecialidadEditor'                                       } },
  { path: 'nosotros',            canActivate: [authGuard], component: Nosotros,           data: { animation: 'Nosotros',            breadcrumb: 'Nosotros'              } },
  { path: 'autoridades',         canActivate: [authGuard], component: Autoridades,        data: { animation: 'Autoridades',         breadcrumb: 'Autoridades'           } },
  { path: 'eventos',             canActivate: [authGuard], component: Eventos,            data: { animation: 'Eventos',             breadcrumb: 'Eventos'               } },
  { path: 'eventos/:id',         canActivate: [authGuard], component: EventoEditor,       data: { animation: 'EventoEditor'                                             } },
  { path: 'campus',              canActivate: [authGuard], component: Campus,             data: { animation: 'Campus',              breadcrumb: 'Campus'                } },
  { path: 'alumnos',             canActivate: [authGuard], component: Estudiantes,        data: { animation: 'Alumnos',             breadcrumb: 'Alumnos'               } },
  { path: 'consejo-estudiantil', canActivate: [authGuard], component: ConsejoEstudiantil, data: { animation: 'ConsejoEstudiantil',  breadcrumb: 'Consejo Estudiantil'   } },
  { path: 'uniformes',           canActivate: [authGuard], component: Uniformes,          data: { animation: 'Uniformes',           breadcrumb: 'Uniformes'             } },
  { path: 'biblioteca',          canActivate: [authGuard], component: Biblioteca,         data: { animation: 'Biblioteca',          breadcrumb: 'Biblioteca'            } },
  { path: 'instructivos',        canActivate: [authGuard], component: Instructivos,       data: { animation: 'Instructivos',        breadcrumb: 'Instructivos'          } },
  { path: 'repositorios',        canActivate: [authGuard], component: Repositorios,       data: { animation: 'Repositorios',        breadcrumb: 'Repositorios'          } },
  { path: 'configuracion',       canActivate: [authGuard], component: Configuracion,      data: { animation: 'Configuracion',       breadcrumb: 'Configuración'         } },
  { path: 'actividad',           canActivate: [authGuard], component: Actividad,          data: { animation: 'Actividad',           breadcrumb: 'Actividad reciente'    } },
  {
    path: 'notificaciones',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notificaciones/notificaciones').then(m => m.Notificaciones),
    data: { breadcrumb: 'Notificaciones' }
  },
  {
    path: 'gestion-estudiantes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/gestion-estudiantes/gestion-estudiantes').then(m => m.GestionEstudiantes),
    data: { breadcrumb: 'Gestión de Estudiantes' }
  },
  {
    path: 'portada-noticias',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/portada-noticias/portada-noticias').then(m => m.PortadaNoticias),
    data: { breadcrumb: 'Portada Noticias' }
  },
  {
    path: 'portada-autoridades',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/portada-autoridades/portada-autoridades').then(m => m.PortadaAutoridades),
    data: { breadcrumb: 'Portada Autoridades' }
  },
];
