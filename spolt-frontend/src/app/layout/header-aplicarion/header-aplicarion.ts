import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para el pipe async
import { AuthService } from '../../auth/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header-aplicarion',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añadimos CommonModule
  templateUrl: './header-aplicarion.html',
  styleUrl: './header-aplicarion.css',
})
export class HeaderAplicarion {
  private authService = inject(AuthService);
  
  // Creamos un Observable que contiene los datos del perfil
  user$: Observable<any> = this.authService.getProfile();
  
  @Input() pageName: string = 'INICIO';
}
