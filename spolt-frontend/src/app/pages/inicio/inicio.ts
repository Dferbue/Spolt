import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

import { Calendario } from './calendario/calendario';
import { Tiempo } from './tiempo/tiempo';
import { InicioService } from './service/inicio';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion, Calendario, Tiempo],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  userName = "Usuario"; // Placeholder for now

  constructor(public inicioService: InicioService) {}
}
