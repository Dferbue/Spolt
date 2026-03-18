import { Component } from '@angular/core';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [],
  templateUrl: './deportes.html',
  styleUrl: './deportes.css',
})
export class Deportes {
    sports = [
    { id: '#001', name: 'FUTBOL', icon: '⚽', type: 'EQUIPO', image: 'futbol.jpg', players: '1,247', events: 89, desc: 'Únete a la comunidad de fútbol más grande. Encuentra jugadores cerca de ti, crea eventos, forma equipos y disfruta de tu deporte favorito.' },
    { id: '#002', name: 'BASKET', icon: '🏀', type: 'EQUIPO', image: 'baloncesto.jpg', players: '850', events: 45, desc: 'El asfalto te espera. Encuentra canchas abiertas, partidos de 3x3 o equipos completos para competir en ligas locales.' },
    { id: '#003', name: 'PADEL', icon: '🎾', type: 'INDIVIDUAL / EQUIPO', image: 'padel.jpg', players: '2,100', events: 156, desc: 'El deporte de moda. Reserva pistas, encuentra parejas de tu nivel y sube en el ranking de PlayMeet.' },
    { id: '#004', name: 'RUNNING', icon: '🏃', type: 'INDIVIDUAL', image: 'running.jpg', players: '500', events: 20, desc: 'No corras solo. Encuentra grupos de entrenamiento y rutas populares en tu ciudad.' },
    { id: '#005', name: 'TENIS', icon: '🎾', type: 'INDIVIDUAL / EQUIPO', image: 'tennis.jpg', players: '1,200', events: 30, desc: 'Siente la emoción de la pista. Encuentra rivales, participa en torneos locales y mejora tu ranking individual o en dobles.' },
    { id: '#006', name: 'VOLEY', icon: '🏐', type: 'EQUIPO', image: 'voley.jpg', players: '600', events: 15, desc: 'Salto y remate. Encuentra equipos de voley playa o pista y disfruta de partidos intensos con la comunidad.' },
    { id: '#007', name: 'PING PONG', icon: '🏓', type: 'INDIVIDUAL / EQUIPO', image: 'pinpon.jpg', players: '300', events: 12, desc: 'Rapidez y reflejos. Encuentra mesas libres, participa en torneos rápidos y demuestra quién es el rey de la mesa en partidas individuales o dobles.' }
  ];
  activeSport = this.sports[0];
}
