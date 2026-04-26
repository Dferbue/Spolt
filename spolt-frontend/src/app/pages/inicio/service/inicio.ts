import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { CalendarEvent } from '../modules/calendar';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SportColorService } from '../../../shared/services/sport-color.service';


@Injectable({
  providedIn: 'root',
})
export class InicioService {

  private readonly apiUrl = `${environment.apiUrl}/events`;
  private readonly http = inject(HttpClient);
  private readonly sportColorService = inject(SportColorService);

  // Eventos en los que el usuario participa (este mes)
  myEvents = signal<CalendarEvent[]>([]);

  //Obtengo los eventos en los que participas del mes actual 
  fetchMyEvents(): void {
    this.http.get<any[]>(`${this.apiUrl}/participante`).subscribe({
      next: (rawEvents) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const mapped: CalendarEvent[] = rawEvents
          .map(ev => this.mapToCalendarEvent(ev))
          .filter(ev => {
            // Solo los eventos de este mes
            const [year, month] = ev.date.split('-').map(Number);
            return year === currentYear && month === (currentMonth + 1);
          });

        this.myEvents.set(mapped);
      },
      error: (err) => {
        console.error('Error al obtener eventos del calendario:', err);
        this.myEvents.set([]);
      }
    });
  }

  //Filtra los eventos para una fecha concreta 
  getMyEventsForDate(date: string): CalendarEvent[] {
    return this.myEvents().filter(e => e.date === date);
  }

  //Transforma el objeto del backend a CalendarEvent del frontend 
  private mapToCalendarEvent(raw: any): CalendarEvent {
    // Extraer fecha en formato YYYY-MM-DD
    const fechaObj = new Date(raw.fecha_evento);
    const date = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;

    // Formatear hora_inicio y hora_fin
    const horaInicio = this.formatTime(raw.hora_inicio);
    const horaFin = raw.hora_fin ? this.formatTime(raw.hora_fin) : null;
    const time = horaFin ? `${horaInicio} - ${horaFin}` : horaInicio;

    // Color según deporte
    const color = this.sportColorService.getColor(raw.deporte);

    return {
      id: raw.id_evento,
      name: raw.titulo,
      time,
      date,
      color,
      sport: raw.deporte?.nombre || 'Deporte',
      type: raw.tipo_evento,
      location: raw.ubicacion || undefined,
    };
  }

  /** Extrae HH:mm de un DateTime ISO */
  private formatTime(isoString: string): string {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
