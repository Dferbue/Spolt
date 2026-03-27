import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion],
  templateUrl: './amigos.html',
  styleUrl: './amigos.css',
})
export class Amigos {
  userName = "Usuario";
}
