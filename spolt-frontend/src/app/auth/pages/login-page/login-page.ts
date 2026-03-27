import { Component, signal, inject } from '@angular/core';
import { Login } from "../../components/login/login";
import { AuthService, LoginDto } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [Login],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = "";
  loading = signal(false);
  readonly logingSingnal = signal<LoginDto>({ email: "", password: "" }); // Corregido de identifier a email

  login(credentials: LoginDto) {
    console.log('Intentando login con:', credentials); // Log para depurar qué se envía exactamente
    
    // 1. Actualizamos la señal con los datos ingresados
    this.logingSingnal.set(credentials);
    
    // 2. Limpiamos cualquier error previo y activamos carga
    this.errorMessage = "";
    this.loading.set(true);

    // 3. Hacemos la llamada al backend usando los datos puros y nos suscribimos
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Login exitoso:', response);
        
        // 4. Guardamos los tokens devueltos por la API en el LocalStorage
        if (response.accessToken && response.refreshToken) {
          this.authService.setTokens(response.accessToken, response.refreshToken);
        }
        
        // 5. Redirigimos al usuario a la página de inicio tras el éxito
        this.router.navigate(['/inicio']); 
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error en el login:', err);
        // 6. Capturamos el error y actualizamos la variable para mostrarla en el HTML
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Comprueba tus datos.';
      }
    });
  }
}
