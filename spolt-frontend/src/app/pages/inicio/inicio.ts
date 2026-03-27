import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  userName = "Usuario"; // Placeholder for now
}
