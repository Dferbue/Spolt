import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { adminGuard } from './auth/guards/admin.guard';

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
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/eventos/eventos-inicio/eventos-inicio')
          .then(m => m.EventosInicio)
      },
      {
        path: 'unirse',
        loadComponent: () => import('./pages/eventos/unirse-eventos/unirse-eventos')
          .then(m => m.UnirseEventos)
      },
      {
        path: 'crear',
        loadComponent: () => import('./pages/eventos/create-event/create-event')
          .then(m => m.CreateEventForm)
      },
      {
        path: 'mis-eventos',
        loadComponent: () => import('./pages/eventos/my-events/my-events')
          .then(m => m.MyEvents)
      }
    ]
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
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin')
      .then(m => m.Admin),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboard) 
      },
      { 
        path: 'usuarios', 
        loadComponent: () => import('./pages/admin/usuarios/usuarios').then(m => m.Usuarios) 
      },
      { 
        path: 'eventos', 
        loadComponent: () => import('./pages/admin/eventos/eventos').then(m => m.Eventos) 
      },
      { 
        path: 'deportes', 
        loadComponent: () => import('./pages/admin/deportes/deportes').then(m => m.Deportes) 
      }
    ]
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
  {
    path: 'confirm-register',
    loadComponent: () => import('./auth/pages/confirm-register-page/confirm-register-page')
      .then(m => m.ConfirmRegisterPage)
  },
  {
    path: 'legal/privacidad',
    loadComponent: () => import('./pages/legal/privacidad/privacidad').then(m => m.Privacidad)
  },
  {
    path: 'legal/terminos',
    loadComponent: () => import('./pages/legal/terminos/terminos').then(m => m.Terminos)
  },
  {
    path: 'legal/aviso-legal',
    loadComponent: () => import('./pages/legal/aviso-legal/aviso-legal').then(m => m.AvisoLegal)
  },
  {
    // Página pública de invitación por código Spolt (ej: spoltweb.com/u/SPOLT-BX4K7M)
    path: 'u/:code',
    loadComponent: () => import('./pages/invite/invite').then(m => m.InvitePage)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];