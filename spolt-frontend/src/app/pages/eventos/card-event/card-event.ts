import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventInterface , eventAction } from '../models/createEvent';
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
}
