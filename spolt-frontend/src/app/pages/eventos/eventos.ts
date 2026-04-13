import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';
import { UnirseEventos } from './unirse-eventos/unirse-eventos';
import { CreateEventForm } from './create-event/create-event';
import { MyEvents } from './my-events/my-events';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion, UnirseEventos, CreateEventForm, MyEvents],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos {
  // Controla qué pantalla principal estamos viendo en la sección Eventos
  vistaActiva = signal<'inicio' | 'unirse' | 'crear' | 'mis-eventos'>('inicio');

  cambiarVista(nuevaVista: 'inicio' | 'unirse' | 'crear' | 'mis-eventos') {
    this.vistaActiva.set(nuevaVista);
  }
}
