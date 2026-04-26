import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, HeaderAplicarion],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  encapsulation: ViewEncapsulation.None
})
export class Admin {
}
