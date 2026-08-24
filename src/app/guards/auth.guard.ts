/**
 * @file auth.guard.ts
 * @description Guard funcional que protege rutas verificando el JWT en localStorage.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return auth.refreshProfile().pipe(
    map(() => true),
    catchError(() => {
      auth.clearSession();
      return of(router.createUrlTree(['/login'], { queryParams: { expired: '1' } }));
    }),
  );
};
