import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InviteService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly frindshipsUrl = `${environment.apiUrl}/frindships`;

  // Obtiene los datos públicos de un usuario por su código Spolt (no requiere sesión)
  getProfileByCode(code: string) {
    return this.http.get<any>(`${this.usersUrl}/code/${code}`);
  }

  // Envía solicitud de amistad usando el código Spolt del receptor (requiere sesión)
  sendFriendRequestByCode(code: string) {
    return this.http.post<any>(`${this.frindshipsUrl}/code/${code}`, {});
  }
}
