import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { filter } from 'rxjs';
import { AuthService } from './auth/services/auth.service';
import { GeolocationService } from './shared/services/geolocation.service';
import { GeoPermissionDialog } from './shared/components/geo-permission-dialog/geo-permission-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    GeoPermissionDialog
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  public geoService = inject(GeolocationService);
  showGlobalLayout = true;
  private pingInterval: any;

  constructor() {
    // Escuchar cambios de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateLayoutState();
    });
  }

  ngOnInit() {
    this.updateLayoutState();
    
    // Latido cada 2 minutos para mantener el estado online
    this.pingInterval = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.pingOnline().subscribe({
          error: (err) => console.error('Error al actualizar estado online:', err)
        });
      }
    }, 2 * 60 * 1000);
  }

  private updateLayoutState() {
    const url = this.router.url;
    // Mostramos el layout global en la raíz, rutas públicas y legales
    this.showGlobalLayout = 
      url === '/' || 
      url === '' || 
      url.startsWith('/#') || 
      url.startsWith('/?') ||
      url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/reset-password') ||
      url.startsWith('/confirm-email') ||
      url.startsWith('/confirm-register') ||
      url.startsWith('/legal');
  }

  ngOnDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}
