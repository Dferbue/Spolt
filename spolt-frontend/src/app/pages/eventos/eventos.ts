import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos {
  userName = "Usuario";
}
