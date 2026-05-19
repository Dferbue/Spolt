import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InviteService } from './invite.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invite.html',
  styleUrl: './invite.css',
})
export class InvitePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(InviteService);
  private authService = inject(AuthService);

  code = signal('');
  profileData = signal<any>(null);
  loading = signal(true);
  notFound = signal(false);

  // Estado del botón de agregar
  actionLoading = signal(false);
  actionMessage = signal('');
  actionError = signal(false);
  actionDone = signal(false);

  // Si el usuario está logueado
  isLoggedIn = signal(false);

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code') || '';
    this.code.set(code.toUpperCase());

    // Comprobamos si hay sesión activa
    const token = this.authService.getAccessToken();
    this.isLoggedIn.set(!!token);

    // Cargamos el perfil público
    this.inviteService.getProfileByCode(this.code()).subscribe({
      next: (data) => {
        this.profileData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      }
    });
  }

  addFriend() {
    if (!this.isLoggedIn()) {
      // Si no está logueado, guardamos el código y redirigimos al registro
      localStorage.setItem('pendingInvite', this.code());
      this.router.navigate(['/register']);
      return;
    }

    this.actionLoading.set(true);
    this.actionMessage.set('');
    this.actionError.set(false);

    this.inviteService.sendFriendRequestByCode(this.code()).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.actionDone.set(true);
        this.actionMessage.set('¡Solicitud de amistad enviada! 🎉');
        this.actionError.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(true);
        const msg = err.error?.message || 'Error al enviar la solicitud';
        // Mensaje más amigable si ya son amigos
        this.actionMessage.set(msg.includes('ya existe') ? '¡Ya sois amigos o tienes una solicitud pendiente!' : msg);
      }
    });
  }

  goToLogin() {
    localStorage.setItem('pendingInvite', this.code());
    this.router.navigate(['/login']);
  }
}
