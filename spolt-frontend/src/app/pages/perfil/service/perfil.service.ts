import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {

  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  // Traer datos del usuario para la tarjeta de perfil
  getDataUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Actualizar email
  updateEmail(data: { email: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update`, data);
  }

  // Actualizar contraseña
  updatePassword(data: { password: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update`, data);
  }

  // Actualizar datos generales (nombre completo, biografía, fecha nacimiento)
  updateDatos(data: {
    nombre_completo?: string;
    biografia?: string;
    fecha_nacimiento?: string;
  }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update`, data);
  }

  // --- Métodos de solicitud (Delegados a Auth) ---

  solicitarCambioPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  solicitarCambioEmail(newEmail: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/request-email-change`, { newEmail });
  }
}
