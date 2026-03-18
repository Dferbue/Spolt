import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', // Landing Welcome Page
    loadComponent: () => import('./pages/welcome/welcome.component')
      .then(m => m.WelcomeComponent)
  },
  {
    path: 'dashboard', // Moved Dashboard to its own route
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
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
  { path: '**', redirectTo: '', pathMatch: 'full' }
];