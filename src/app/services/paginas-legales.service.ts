/**
 * @file paginas-legales.service.ts
 * @description Texto de las páginas legales del sitio (Política de privacidad y
 * Términos de uso), guardado en la configuración 'paginas_legales'.
 * El texto por defecto debe coincidir con web-front/src/app/pages/legal-page/legal-defaults.ts.
 *
 * Formato del contenido: "## " inicia un título de sección, "- " un punto de lista,
 * una línea en blanco separa párrafos.
 */
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ConfiguracionApiService } from './configuracion-api.service';

export interface PaginaLegal {
  titulo: string;
  actualizado: string; // YYYY-MM-DD
  contenido: string;
}

export interface PaginasLegales {
  privacidad: PaginaLegal;
  terminos: PaginaLegal;
}

export const PAGINAS_LEGALES_DEFAULT: PaginasLegales = {
  privacidad: {
    titulo: 'Política de privacidad',
    actualizado: '2026-11-17',
    contenido: `La Unidad Educativa Técnico Salesiano (en adelante, "la Institución") respeta la privacidad de su comunidad educativa y de quienes visitan este sitio web. Esta política explica qué datos personales tratamos, para qué los usamos y cómo puedes ejercer tus derechos, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.

## Responsable del tratamiento
El responsable del tratamiento de los datos es la Unidad Educativa Técnico Salesiano, con domicilio en Av. Don Bosco y Felipe II, Cuenca, Ecuador. Para cualquier consulta sobre esta política puedes escribir a uets@uets.edu.ec.

## Datos que recopilamos
- Datos que nos entregas al escribirnos o llenar un formulario: nombre, correo electrónico, teléfono y el contenido de tu mensaje.
- Datos de estudiantes y representantes que la Institución publica con fines académicos o institucionales, como nombres, fotografías y logros.
- Datos técnicos de navegación: dirección IP, tipo de navegador y páginas visitadas, que se usan de forma agregada para el funcionamiento y la seguridad del sitio.

## Para qué usamos tus datos
- Responder a tus consultas y solicitudes de información.
- Gestionar procesos de admisión, matrícula y comunicación con la comunidad educativa.
- Difundir actividades, eventos y logros institucionales.
- Mantener la seguridad y mejorar el funcionamiento del sitio web.

## Base legal
Tratamos los datos con tu consentimiento, para cumplir obligaciones legales propias del servicio educativo, o por el interés legítimo de la Institución en informar sobre sus actividades. La publicación de imágenes de estudiantes menores de edad se realiza con la autorización de sus representantes legales.

## Con quién compartimos los datos
No vendemos ni cedemos datos personales a terceros. Solo los compartimos con autoridades cuando la ley lo exige, o con proveedores de servicios tecnológicos que actúan por cuenta de la Institución y están obligados a protegerlos.

## Cuánto tiempo los conservamos
Conservamos los datos durante el tiempo necesario para la finalidad para la que fueron recogidos y para cumplir las obligaciones legales de la Institución. Después se eliminan o se anonimizan.

## Tus derechos
Como titular de los datos puedes ejercer en cualquier momento tus derechos de acceso, rectificación y actualización, eliminación, oposición, portabilidad y suspensión del tratamiento, así como revocar tu consentimiento. Para hacerlo, escribe a uets@uets.edu.ec indicando tu nombre, el derecho que deseas ejercer y una copia de tu documento de identidad. Si consideras que tus derechos no fueron atendidos, puedes acudir a la Superintendencia de Protección de Datos Personales.

## Seguridad
Aplicamos medidas técnicas y organizativas razonables para proteger los datos contra pérdida, acceso no autorizado o alteración.

## Cookies
Este sitio puede usar cookies técnicas necesarias para su funcionamiento. No usamos cookies con fines publicitarios.

## Cambios a esta política
Podemos actualizar esta política cuando sea necesario. La fecha de la última actualización aparece al inicio de esta página.`,
  },
  terminos: {
    titulo: 'Términos de uso',
    actualizado: '2026-11-17',
    contenido: `Estos términos regulan el uso del sitio web de la Unidad Educativa Técnico Salesiano (en adelante, "la Institución"). Al navegar por el sitio aceptas estas condiciones; si no estás de acuerdo con ellas, te pedimos no utilizarlo.

## Objeto del sitio
El sitio ofrece información institucional sobre la oferta educativa, admisiones, eventos, noticias y servicios de la Institución. Su contenido es informativo y puede cambiar sin previo aviso.

## Uso permitido
- Usar el sitio de forma lícita, respetuosa y conforme a estos términos.
- No intentar acceder sin autorización a áreas restringidas, sistemas o datos de la Institución.
- No publicar ni enviar contenido ofensivo, falso o que vulnere derechos de terceros.
- No usar el sitio para fines comerciales o publicitarios sin autorización escrita.

## Propiedad intelectual
Los textos, logotipos, fotografías, videos y demás contenidos del sitio pertenecen a la Institución o se usan con autorización de sus titulares. Puedes compartirlos con fines informativos citando la fuente, pero no modificarlos ni usarlos con fines comerciales sin permiso.

## Imágenes de la comunidad educativa
Las fotografías de estudiantes se publican con fines institucionales y con autorización de sus representantes. No está permitido descargarlas, reproducirlas ni difundirlas fuera de ese contexto. Si deseas que se retire una imagen, escribe a uets@uets.edu.ec.

## Enlaces a otros sitios
El sitio contiene enlaces a plataformas y páginas de terceros, como plataformas educativas. La Institución no controla esos sitios y no es responsable de su contenido ni de sus políticas de privacidad.

## Responsabilidad
La Institución procura que la información sea correcta y esté actualizada, pero no garantiza que el sitio esté libre de errores o disponible en todo momento. La información oficial sobre procesos académicos y de admisión se confirma siempre por los canales oficiales de la Institución.

## Protección de datos
El tratamiento de datos personales se rige por nuestra Política de privacidad.

## Cambios a estos términos
Podemos modificar estos términos cuando sea necesario. La versión vigente es la publicada en esta página, con su fecha de última actualización.

## Legislación aplicable
Estos términos se rigen por las leyes de la República del Ecuador. Cualquier controversia se someterá a los jueces competentes de la ciudad de Cuenca.`,
  },
};

const CLAVE = 'paginas_legales';

@Injectable({ providedIn: 'root' })
export class PaginasLegalesService {
  constructor(private configApi: ConfiguracionApiService) {}

  /** Lee el texto guardado; lo que falte se completa con el texto por defecto. */
  cargar(): Observable<PaginasLegales> {
    return this.configApi.get<Partial<PaginasLegales>>(CLAVE).pipe(
      map(cfg => ({
        privacidad: { ...PAGINAS_LEGALES_DEFAULT.privacidad, ...(cfg?.privacidad ?? {}) },
        terminos:   { ...PAGINAS_LEGALES_DEFAULT.terminos,   ...(cfg?.terminos ?? {}) },
      })),
    );
  }

  guardar(datos: PaginasLegales): Observable<void> {
    return this.configApi.guardar(CLAVE, datos);
  }

  porDefecto(tipo: keyof PaginasLegales): PaginaLegal {
    return { ...PAGINAS_LEGALES_DEFAULT[tipo] };
  }
}
