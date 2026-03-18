import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
export class WelcomeComponent {}
