import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Inicio } from './inicio/inicio';
import { Habilidades } from './habilidades/habilidades';
import { Guia } from './guia/guia';
import { Deportes } from './deportes/deportes';
import { Conocenos } from './conocenos/conocenos';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Added RouterModule
    Inicio,
    Habilidades,
    Guia,
    Deportes,
    Conocenos
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    // Si el usuario ya tiene sesión activa, lo mandamos directo a inicio
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }
}
