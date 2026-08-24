/**
 * @file auth.interceptor.ts
 * @description Interceptor funcional que adjunta el JWT a cada petición HTTP.
 *
 * POLÍTICA DE ERRORES:
 * - 401 en /auth/me o /auth/login → sesión inválida, redirige al login
 * - 401 en cualquier otra ruta    → solo propaga el error, NO borra la sesión
 *   (evita que una petición de datos fallida cierre la sesión activa)
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'uets_token';

/** Rutas cuyo 401 sí debe cerrar la sesión. */
const AUTH_ROUTES = ['/auth/me'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem(TOKEN_KEY);

  // Adjunta el token si existe
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const isAuthRoute = AUTH_ROUTES.some(route => req.url.includes(route));
        if (isAuthRoute) {
          // Token expirado o inválido confirmado por el backend → cierra sesión
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('uets_user');
          router.navigate(['/login'], { queryParams: { expired: '1' } });
        }
        // Para otras rutas: propaga el error pero NO cierra la sesión
      }
      return throwError(() => err);
    }),
  );
};
