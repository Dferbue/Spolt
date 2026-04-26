import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.getProfile().pipe(
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }
      // Si no es admin, redirigir al inicio o mostrar error
      return router.parseUrl('/inicio');
    })
  );
};
