import { Component, signal, inject } from '@angular/core';
import { Register } from "../../components/register/register";
import { RegisterDto, AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [Register],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  // 2. Estado del componente:
  // Variable para mostrar errores en caso de que el backend los devuelva (ej. "El usuario ya existe").
  errorMessage = "";
  loading = signal(false);
  
  // Usamos un Signal para almacenar el estado del formulario de registro.
  // Lo inicializamos vacío pero con la estructura de RegisterDto que espera NestJS.
  readonly registerSignal = signal<RegisterDto>({ 
    nombre_usuario: "", 
    email: "",
    password: "",
    fecha_nacimiento: ""
  });

  // 3. Método principal que se ejecuta cuando el <app-register> emite el evento
  register(credentials: RegisterDto) {
    // Actualizamos el Signal con los datos que nos ha pasado el componente hijo
    this.registerSignal.set(credentials);
    
    this.errorMessage = "";
    this.loading.set(true);

    // Llamamos al método "register" de nuestro AuthService pasándole los datos.
    // .subscribe() es lo que realmente hace que se dispare la petición HTTP ('POST /auth/register')
    this.authService.register(credentials).subscribe({
      
      // Bloque NEXT: Se ejecuta solo si el servidor responde que TODO FUE BIEN (código 201)
      next: (response) => {
        this.loading.set(false);
        console.log('Registro exitoso:', response);
        
        // Normalmente, cuando un usuario se registra de cero, el backend crea la cuenta
        // pero no devuelve los tokens directamente, así que lo mandamos a que inicie sesión.
        // Redirigimos al usuario a la vista de login.
        this.router.navigate(['/login']); 
      },
      
      // Bloque ERROR: Se ejecuta si el servidor devuelve algún error (código 400, 409, 500...)
      error: (err) => {
        this.loading.set(false);
        console.error('Error en el registro:', err);
        // Intentamos leer el mensaje original que escupe el servidor NestJS (ej. "Email already exists").
        // Si no logramos leerlo, ponemos un texto genérico.
        this.errorMessage = err.error?.message || 'Error al crear la cuenta. Revisa tus datos e inténtalo de nuevo.';
      }
    });
  }
}
