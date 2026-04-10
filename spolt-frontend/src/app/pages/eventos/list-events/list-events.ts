import { Component, input, output } from '@angular/core';
import { EventInterface ,eventAction} from '../models/createEvent';
import { CardEvent } from '../card-event/card-event';
import { every } from 'rxjs';

@Component({
  selector: 'app-list-events',
  imports: [CardEvent],
  templateUrl: './list-events.html',
  styleUrl: './list-events.css',
})
export class ListEvents {
  //Inputs 
  public listEvents= input<EventInterface[]>();
  public joinedEventsId = input<number[]>([]);

  //Ootputs
  protected output_Id_Event= output<eventAction>();

  //FUncion para mandar el output
  sendIdEvent(data:eventAction){
    this.output_Id_Event.emit(data);
  }
}
