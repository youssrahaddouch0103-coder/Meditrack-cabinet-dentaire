import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';
import { STAFF_ROLES } from '../config/access.config';

/**
 * Autorise la route si l'utilisateur connecté a l'un des rôles de `route.data.roles`.
 * Non connecté : page de connexion. Mauvais rôle : tableau de bord (personnel) ou accueil (patient).
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/admin/connexion'], { queryParams: { returnUrl: state.url } });
  }

  const allowed = (route.data?.['roles'] as Role[] | undefined) ?? STAFF_ROLES;
  if (auth.hasRole(...allowed)) return true;

  return auth.hasRole(...STAFF_ROLES) ? router.createUrlTree(['/admin/tableau-de-bord']) : router.createUrlTree(['/']);
};
