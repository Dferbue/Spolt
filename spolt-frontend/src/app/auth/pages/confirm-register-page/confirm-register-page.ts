import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirm-register-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-register-page.html',
  styleUrl: './confirm-register-page.css'
})
export class ConfirmRegisterPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = signal(true);
  success = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.loading.set(false);
        this.errorMessage.set('Enlace inválido. No se ha proporcionado un token.');
        return;
      }

      this.authService.confirmRegistration(token).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.success.set(true);
          // Redirigir al login después de 4 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 4000);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al verificar la cuenta. Es posible que el enlace haya expirado o ya haya sido utilizado.');
        }
      });
    });
  }
}
