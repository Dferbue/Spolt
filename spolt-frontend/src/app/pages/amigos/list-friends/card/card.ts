import { Component, computed, input, output } from '@angular/core';
import { Amistad } from '../../models/amistad';
import { DatePipe, CommonModule } from '@angular/common';
import { AmistadAction } from '../../models/asmitadAction';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-card',
  imports: [DatePipe, CommonModule],

  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  //Input para recivir informacion del padre o el abuelo
  public readonly amigo = input.required<Amistad>()
  public readonly currentUser = input.required<string>()
  public readonly listamostrada= input.required<string>()

  public apiUrl = environment.apiUrl;


  //Outputs que mandaremos al padre y al abuelo para trabajar con el servicio
  protected amistadAction = output<AmistadAction>();

  //Vatiable que nos diga si la ventana esa abierta
  viewWindow:boolean=false;
  targetaAmistad:boolean=false;

  //Hacemos la funcion que nos abrira y nos cerrara la ventana
  changeStatusWIindow(){
    this.viewWindow=!this.viewWindow;
  }

  changeStatusTargetaAmistad(){
    this.targetaAmistad=!this.targetaAmistad;
  }
  
  // Determinamos qué usuario mostrar (el que no somos nosotros)
  public readonly amigoAMostrar = computed(() => {
    const solicitud = this.amigo();
    const nombreUsuarioActual = this.currentUser();
    if (solicitud.solicitante.nombre_usuario === nombreUsuarioActual) {
      return solicitud.receptor;
    } else {
      return solicitud.solicitante;
    }
  });

  // Comprueba si el amigo está online (activo en los últimos 5 minutos)
  public readonly estaOnline = computed(() => {
    const amigo = this.amigoAMostrar();
    if (!amigo.ultimo_acceso) return false;
    const ultimoAcceso = new Date(amigo.ultimo_acceso).getTime();
    const ahora = Date.now();
    return (ahora - ultimoAcceso) < 5 * 60 * 1000; // 5 minutos
  });

  //Funcion que nos mandara al padre la informacion cuando le demo a un boton
  protected sendFatherAmistadAction(data:AmistadAction){
    this.amistadAction.emit(data);
  }

  //Vamos a hacer una funcion que nos pregunte antes de hacer una accion de eliminar la amistad si estamnos seguros
}


