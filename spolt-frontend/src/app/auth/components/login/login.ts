import { Component, output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginDto } from '../../services/auth.service';

@Component({
  selector: 'app-login', // Changed from app-register
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  message: string = "";
  @Input() loading = false;
  @Input() serverError = "";
  public sendLogin = output<LoginDto>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Cambiado de identifier a email con validación de tipo email
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  login() {
    if(this.loginForm.invalid) {
      this.message = "Please correct all errors and resubmit the form";
      this.loginForm.markAllAsTouched();
    } else {
      this.message = "";
      this.serverError = "";
      const loginData: LoginDto = {
        email: this.loginForm.value.email, // Enviamos el campo 'email' que el backend espera
        password: this.loginForm.value.password
      };
      
      this.sendLogin.emit(loginData);
    }
  }

  // --- Forgot Password Logic ---
  showForgotModal = false;
  forgotForm!: FormGroup;
  forgotMsg = '';
  forgotError = '';
  isSubmittingForgot = false;

  openForgotModal() {
    this.showForgotModal = true;
    this.forgotMsg = '';
    this.forgotError = '';
    if (!this.forgotForm) {
      this.forgotForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    } else {
      this.forgotForm.reset();
    }
  }

  closeForgotModal() {
    this.showForgotModal = false;
  }

  sendForgotPassword() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.isSubmittingForgot = true;
    this.forgotError = '';
    this.forgotMsg = '';

    const email = this.forgotForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.forgotMsg = 'Si el correo existe, te hemos enviado un enlace para restablecer la contraseña.';
        this.isSubmittingForgot = false;
      },
      error: (err) => {
        // En un caso real, por seguridad no se suele decir si el correo existe o no,
        // pero podemos mostrar el error si hay un fallo real del servidor.
        this.forgotError = err.error?.message || 'Hubo un error al procesar tu solicitud.';
        this.isSubmittingForgot = false;
      }
    });
  }
}
