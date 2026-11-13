/**
 * @file admin.guard.ts
 * @description Permite el acceso solo a administradores (super_admin y admin).
 * Debe usarse después de authGuard, que ya refrescó el perfil.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ROLES_ADMIN = ['super_admin', 'admin'];

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasRole(...ROLES_ADMIN) ? true : inject(Router).createUrlTree(['/']);
};
