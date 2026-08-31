/**
 * @file gridfs-url.interceptor.ts
 * @description Reescribe cualquier URL de imagen GridFS que venga en una respuesta
 * del backend para que apunte siempre al origen configurado en `environment.apiUrl`.
 *
 * Por qué existe: `process_and_store_image()` en el backend graba la URL completa
 * (con el host de `BACKEND_URL` vigente en ese momento) dentro del documento de
 * Mongo. Si el backend cambia de host (dev → prod, cambio de dominio, etc.), esas
 * URLs quedan "congeladas" apuntando al host viejo. Este interceptor normaliza
 * cualquier `/api/v1/imagenes/gridfs/{id}` a `${environment.apiUrl}/imagenes/gridfs/{id}`
 * sin importar qué endpoint la haya devuelto — antes esto solo se aplicaba a mano en
 * un par de servicios de configuración, dejando sin normalizar `/recursos`, `/logros`,
 * `/eventos`, etc.
 */
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const GRIDFS_MARKER = '/api/v1/imagenes/gridfs/';

function normalizeGridfsUrls<T>(value: T): T {
  if (typeof value === 'string') {
    if (value.includes(GRIDFS_MARKER)) {
      const id = value.split(GRIDFS_MARKER).pop();
      return `${environment.apiUrl}/imagenes/gridfs/${id}` as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeGridfsUrls(item)) as unknown as T;
  }
  // Solo recorrer objetos "planos" (respuestas JSON) — nunca Blob/ArrayBuffer/Date/etc.
  if (value && typeof value === 'object' && (value as object).constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const key in value as Record<string, unknown>) {
      result[key] = normalizeGridfsUrls((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return value;
}

export const gridfsUrlInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        return event.clone({ body: normalizeGridfsUrls(event.body) });
      }
      return event;
    }),
  );
};
