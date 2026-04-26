import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SportColorService {
  //Color de marca Spolt, usado cuando el deporte no tiene color asignado en BD /
  private readonly defaultColor = '#ff006e';

  //Devuelve el color del deporte.Si tiene color en BD lo usa, si no devuelve el rosa de Spolt.
  getColor(deporte: any): string {
    return deporte?.color || this.defaultColor;
  }

  //Genera el box-shadow neo-brutalista con el color del deporte
  getShadow(deporte: any, offset: number = 4): string {
    return `${offset}px ${offset}px 0px ${this.getColor(deporte)}`;
  }

  //Genera un resplandor semitransparente, útil para barras de XP
  getGlow(deporte: any): string {
    return `0 0 12px ${this.getColor(deporte)}55`;
  }

  //Oscurece un color HEX un porcentaje dado (ej. 20%)
  getDarkColor(deporte: any, percent: number = 20): string {
    const color = this.getColor(deporte);
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return color;

    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Obtiene un emoji representativo (pelota/icono) según el nombre del deporte
  getSportEmoji(deporte: any): string {
    const nombre = deporte?.nombre?.toLowerCase() || '';
    if (nombre.includes('fútbol') || nombre.includes('futbol')) return '⚽';
    if (nombre.includes('baloncesto') || nombre.includes('basket')) return '🏀';
    if (nombre.includes('voley') || nombre.includes('voleibol')) return '🏐';
    if (nombre.includes('tenis')) return '🎾';
    if (nombre.includes('pádel') || nombre.includes('padel')) return '🎾'; // Padel uses tennis ball or racquet 🏓
    if (nombre.includes('natación') || nombre.includes('natacion')) return '🏊‍♂️';
    if (nombre.includes('atletismo') || nombre.includes('correr')) return '🏃‍♂️';
    if (nombre.includes('rugby') || nombre.includes('americano')) return '🏈';
    if (nombre.includes('beisbol') || nombre.includes('béisbol')) return '⚾';
    if (nombre.includes('ping') || nombre.includes('mesa')) return '🏓';
    if (nombre.includes('golf')) return '⛳';
    if (nombre.includes('boxeo')) return '🥊';
    if (nombre.includes('ciclismo') || nombre.includes('bici')) return '🚴‍♂️';
    if (nombre.includes('badminton')) return '🏸';
    if (nombre.includes('billar')) return '🎱';
    return '🏅'; // Fallback
  }
}
