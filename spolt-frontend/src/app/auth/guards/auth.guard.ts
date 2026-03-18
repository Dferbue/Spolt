import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Utiliza el AuthService para saber si el usuario tiene sesión iniciada
  if (authService.isLoggedIn()) {
    return true;
  }
  
  // Si no está logueado, lo redirigimos a la página de login
  return router.parseUrl('/login');
};
