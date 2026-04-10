import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', // Landing Welcome Page
    loadComponent: () => import('./pages/welcome/welcome.component')
      .then(m => m.WelcomeComponent)
  },
  {
    path: 'inicio', // Updated from dashboard
    loadComponent: () => import('./pages/inicio/inicio')
      .then(m => m.Inicio),
    canActivate: [authGuard]
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos')
      .then(m => m.Eventos),
    canActivate: [authGuard]
  },
  {
    path: 'amigos',
    loadComponent: () => import('./pages/amigos/amigos')
      .then(m => m.Amigos),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil')
      .then(m => m.Perfil),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login-page/login-page')
      .then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/pages/register-page/register-page')
      .then(m => m.RegisterPage)
  },
  // Catch all route redirects to welcome
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/pages/reset-password-page/reset-password-page')
      .then(m => m.ResetPasswordPage)
  },
  {
    path: 'confirm-email',
    loadComponent: () => import('./auth/pages/confirm-email-page/confirm-email-page')
      .then(m => m.ConfirmEmailPage)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];