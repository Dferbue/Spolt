import { Component, output } from '@angular/core';
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
      const loginData: LoginDto = {
        email: this.loginForm.value.email, // Enviamos el campo 'email' que el backend espera
        password: this.loginForm.value.password
      };
      
      this.sendLogin.emit(loginData);
    }
  }
}
