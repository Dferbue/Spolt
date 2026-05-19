import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class amigosService {
    private readonly apiUrl = `${environment.apiUrl}/frindships`;
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    // Nos traemos las amistades del usuario
    friendsUser(){
      return this.http.get<any>(this.apiUrl);
    }

    // Obtenemos el perfil del usuario (delegado a AuthService)
    getProfile() {
      return this.authService.getProfile();
    }

    //Enviamos un solicutuda de amistad por nombre de usuario
    sendFriendsShip(userName:string){
      return this.http.post<any>(`${this.apiUrl}/${userName}`,{}); //Los metodos post requieren simpre del body por eso {}
    }
    
    //Enviamos solicitud de amistad por código Spolt
    sendFriendsShipByCode(code:string) {
      return this.http.post<any>(`${this.apiUrl}/code/${code}`, {});
    }

    //Nos traemos las solicutudes de amistad que hemos recivido
    getSolicitudesAmistad(){
      return this.http.get<any>(`${this.apiUrl}/recived`);
    }

    //Nos traemos las solicitudes de amistad que hemos enviado
    getSolicitudesEnviadas(){
      return this.http.get<any>(`${this.apiUrl}/send`);
    }

    //Vamos a  crear la funcion para aceptar las solicitud de amistad
    aceptSolcitudAmistad(id_amistad:string){
      return this.http.patch<any>(`${this.apiUrl}/accept/${id_amistad}`,{})
    }

    //Creamos la funcion que usaremso para eliminar las amitadades , rechazarlas y cancelarlas
    deleteAmistad(id_amistad:string){
      return this.http.delete<any>(`${this.apiUrl}/${id_amistad}`);
    }
}


