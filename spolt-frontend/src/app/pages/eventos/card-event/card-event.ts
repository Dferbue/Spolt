import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventInterface , eventAction } from '../models/createEvent';
import { environment } from '../../../../environments/environment';
import { SportColorService } from '../../../shared/services/sport-color.service';

@Component({
  selector: 'app-card-event',
  imports: [CommonModule],
  templateUrl: './card-event.html',
  styleUrl: './card-event.css',
})
export class CardEvent {
    //Imputs
    public evento=input<EventInterface>();
    public isJoined=input<boolean>(false);
    public isOwner=input<boolean>(false);

    public apiUrl = environment.apiUrl;
    private sportColorService = inject(SportColorService);

    get sportColor(): string {
      return this.sportColorService.getColor(this.evento()?.deporte);
    }

    get sportShadow(): string {
      return this.sportColorService.getShadow(this.evento()?.deporte);
    }

    get sportDarkColor(): string {
      return this.sportColorService.getDarkColor(this.evento()?.deporte, 30);
    }

    //Output
    protected out_Id_Event=output<eventAction>();

    //FUncion para mandra el output
    sendIDevent(data:eventAction){
      this.out_Id_Event.emit(data);
    }

    // Formatear la hora correctamente
    get horaFormateada(): string {
      const h = this.evento()?.hora_inicio;
      if (!h) return '--:--';
      
      // Si recibimos formato ISO (ej. 1970-01-01T15:30:00Z)
      if (h.includes('T')) {
         const date = new Date(h);
         // Extraemos UTC Hours directamente porque Prisma guarda @db.Time en UTC,
         // y queremos respetar las horas exactas escritas por el creador.
         const pad = (n: number) => n < 10 ? '0' + n : n;
         return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
      }
      
      // Si recibimos formato cadena "15:30:00" o similar
      return h.substring(0, 5);
    }

    // Comprueba si la fecha+hora del evento ya ha pasado
    get eventoYaComenzo(): boolean {
      const ev = this.evento();
      if (!ev) return false;

      const fecha = new Date(ev.fecha_evento);
      const hora = ev.hora_inicio;

      if (hora && hora.includes('T')) {
        const h = new Date(hora);
        fecha.setHours(h.getUTCHours(), h.getUTCMinutes(), 0, 0);
      } else if (hora) {
        const [hh, mm] = hora.split(':').map(Number);
        fecha.setHours(hh, mm, 0, 0);
      }

      return new Date() >= fecha;
    }
}
