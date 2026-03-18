import { Component } from '@angular/core';

@Component({
  selector: 'app-habilidades',
  standalone: true,
  imports: [],
  templateUrl: './habilidades.html',
  styleUrl: './habilidades.css',
})
export class Habilidades {
  skills = [
    { name: 'CREAR EVENTOS', lv: 99, desc: 'Crea partidos y quedadas en segundos. Elige fecha, hora y lugar.', pwr: 95, vel: 88 },
    { name: 'INVITAR AMIGOS', lv: 85, desc: 'Envía invites a tu lista de contactos y grupos.', pwr: 70, vel: 92 },
    { name: 'ENCONTRAR CANCHAS', lv: 72, desc: 'Busca las mejores instalaciones cerca de ti.', pwr: 60, vel: 75 },
    { name: 'NOTIFICACIONES', lv: 90, desc: 'Recibe alertas de tus deportes favoritos.', pwr: 40, vel: 95 }
  ];
  selected = this.skills[0];
}
