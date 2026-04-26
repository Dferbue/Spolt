import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTotalUsuarios(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/users?page=1&limit=1`).pipe(
      map(res => res?.meta?.total ?? 0)
    );
  }

  getUsuariosList(page: number = 1, limit: number = 10, search: string = '', role: string = '', year: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (year) params = params.set('year', year);

    return this.http.get<any>(`${this.apiUrl}/users`, { params });
  }

  getEventosActivos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/events/count-active`);
  }

  getEventosList(paramsObj?: any): Observable<any[]> {
    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach(key => {
        if (paramsObj[key] !== null && paramsObj[key] !== undefined && paramsObj[key] !== '') {
          params = params.set(key, paramsObj[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/events`, { params });
  }

  getTotalDeportes(): Observable<number> {
    return this.http.get<any[]>(`${this.apiUrl}/sports`).pipe(
      map(sports => Array.isArray(sports) ? sports.length : 0)
    );
  }

  getTotalDeportesList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sports`);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, { role });
  }

  getAmigosUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/frindships/admin/${idUsuario}`);
  }

  deleteEvento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${id}`);
  }

  deleteDeporte(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/sports/${id}`);
  }

  updateDeporte(id: number, data: { nombre?: string; descripcion?: string; imagen_icono?: string; color?: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/sports/${id}`, data);
  }

  createDeporte(data: { nombre: string; descripcion?: string; imagen_icono?: string; color?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sports`, data);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/storage/upload`, formData);
  }
}
