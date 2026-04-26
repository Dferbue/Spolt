import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { filter } from 'rxjs';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,

  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  showGlobalLayout = true;
  private pingInterval: any;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide global header/footer for app routes
      const appRoutes = ['/inicio', '/eventos', '/amigos', '/perfil', '/admin'];
      this.showGlobalLayout = !appRoutes.some(route => event.urlAfterRedirects.startsWith(route));
    });
  }

  ngOnInit() {
    // Latido cada 2 minutos para mantener el estado online
    this.pingInterval = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.pingOnline().subscribe({
          error: (err) => console.error('Error al actualizar estado online:', err)
        });
      }
    }, 2 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}
