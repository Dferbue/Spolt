import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirm-email-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-email-page.html',
  styleUrl: './confirm-email-page.css'
})
export class ConfirmEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Token de confirmación no válido.');
      return;
    }

    this.authService.confirmEmailChange(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message || 'Correo confirmado con éxito. Ya puedes cerrar esta ventana o volver al inicio.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Hubo un error al confirmar tu nuevo correo.');
      }
    });
  }
}
