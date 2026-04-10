import { Component, input, output } from '@angular/core';
import { Amistad } from '../models/amistad';
import { Card } from './card/card';
import { AmistadAction } from '../models/asmitadAction';

@Component({
  selector: 'app-list-friends',
  imports: [Card],
  templateUrl: './list-friends.html',
  styleUrl: './list-friends.css',
})
export class ListFriends {
  //Imputs 
    public listFriends = input.required<Amistad[]>()
    public currentUser = input.required<string>()
    public listaMostrada= input.required<string>()

  //outputs
  protected amistadAction = output<AmistadAction>();

  //Funcion para mandarle al padre
  protected sendFatherAmistadAction(data:AmistadAction){
    this.amistadAction.emit(data);
  }

}

