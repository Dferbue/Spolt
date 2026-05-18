import { Component, inject, HostBinding, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { amigosService } from '../../pages/amigos/service/amigos.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  private amigosService = inject(amigosService);
  
  public profile$ = this.authService.getProfile();
  public pendingRequestsCount = signal<number>(0);

  @HostBinding('class.modal-open') showLogoutConfirm = false;

  ngOnInit() {
    this.fetchRequests();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.fetchRequests();
      }
    });
  }

  fetchRequests() {
    this.amigosService.getSolicitudesAmistad().subscribe({
      next: (reqs) => {
        this.pendingRequestsCount.set(reqs?.length || 0);
      },
      error: () => {
        // Ignorar error si no hay sesión o falla la red
      }
    });
  }

  toggleLogoutConfirm() {
    this.showLogoutConfirm = !this.showLogoutConfirm;
  }

  confirmLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        // Fallback: even if the server call fails, we should redirect and clear tokens
        this.router.navigate(['/']);
      }
    });
  }
}
