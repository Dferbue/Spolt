import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  userName = "Usuario";
}
