import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

// Estado compartido para evitar múltiples refreshes simultáneos
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No interceptar las peticiones de auth (login, register, refresh) para evitar bucles
  // Tampoco interceptar las rutas públicas (invitaciones por código)
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/confirm-register',
    '/auth/resend-verification',
    '/users/code/', // Página pública de invitación por código Spolt
  ];
  if (publicRoutes.some(route => req.url.includes(route))) {
    return next(req.clone({ withCredentials: true }));
  }

  const authReq = addToken(req, authService.getAccessToken());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401, intentamos renovar el token
      if (error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  let cloned = req.clone({ withCredentials: true });

  if (token) {
    cloned = cloned.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return cloned;
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  // Si ya estamos refrescando, encolamos la petición hasta que termine
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(addToken(req, token)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshTokens().pipe(
    switchMap((tokens) => {
      isRefreshing = false;

      // Guardar los nuevos tokens y actualizar última actividad
      authService.setTokens(tokens.accessToken, tokens.refreshToken);
      refreshTokenSubject.next(tokens.accessToken);

      // Reintentar la petición original con el nuevo token
      return next(addToken(req, tokens.accessToken));
    }),
    catchError((refreshError) => {
      // El refresh token también ha caducado → sesión expirada (>14 días inactivo)
      isRefreshing = false;
      authService.clearTokens();
      router.navigate(['/login']);
      return throwError(() => refreshError);
    })
  );
}
