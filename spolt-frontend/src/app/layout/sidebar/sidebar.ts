import { Component, inject, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  @HostBinding('class.modal-open') showLogoutConfirm = false;

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
