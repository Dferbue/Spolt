import { Component, signal, inject } from '@angular/core';
import { Register } from "../../components/register/register";
import { RegisterDto, AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [Register, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = "";
  loading = signal(false);
  registroExitoso = signal(false);
  registeredEmail = signal('');

  // Estado del reenvío
  resendLoading = signal(false);
  resendMessage = signal('');
  resendError = signal(false);
  resendCooldown = signal(false);

  readonly registerSignal = signal<RegisterDto>({ 
    nombre_usuario: "", 
    email: "",
    password: "",
    fecha_nacimiento: "",
    aceptado_terminos: false
  });

  register(credentials: RegisterDto) {
    this.registerSignal.set(credentials);
    this.errorMessage = "";
    this.loading.set(true);

    this.authService.register(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.registroExitoso.set(true);
        this.registeredEmail.set(credentials.email);
        console.log('Registro exitoso:', response);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error en el registro:', err);
        this.errorMessage = err.error?.message || 'Error al crear la cuenta. Revisa tus datos e inténtalo de nuevo.';
      }
    });
  }

  resendVerification() {
    if (this.resendCooldown()) return;

    this.resendLoading.set(true);
    this.resendMessage.set('');
    this.resendError.set(false);

    this.authService.resendVerification(this.registeredEmail()).subscribe({
      next: (res) => {
        this.resendLoading.set(false);
        this.resendMessage.set(res.message || '¡Correo reenviado! Revisa tu bandeja de entrada y la carpeta de spam.');
        this.resendError.set(false);
        // Cooldown de 30 segundos para evitar spam
        this.resendCooldown.set(true);
        setTimeout(() => this.resendCooldown.set(false), 30000);
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.resendMessage.set(err.error?.message || 'Error al reenviar el correo. Inténtalo de nuevo.');
        this.resendError.set(true);
      }
    });
  }
}
