import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateEvent, EventInterface } from '../models/createEvent';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private readonly apiUrl = `${environment.apiUrl}/events`;
  private readonly http = inject(HttpClient);
  private readonly apiUlrSports = `${environment.apiUrl}/sports`;

  // Creamos todas la funciones del servicio

  // Funcion para traernos los datos de los eventos (con paginación y filtros)
  getAllEvents(params: {
    page?: number;
    limit?: number;
    search?: string;
    id_deporte?: number;
    tipo_evento?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    lat?: number;
    lng?: number;
    radio_km?: number;
    sort?: string;
  }) {
    const { page = 1, limit = 30, search, id_deporte, tipo_evento, fecha_desde, fecha_hasta, lat, lng, radio_km, sort } = params;
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (id_deporte) url += `&id_deporte=${id_deporte}`;
    if (tipo_evento) url += `&tipo_evento=${tipo_evento}`;
    if (fecha_desde) url += `&fecha_desde=${fecha_desde}`;
    if (fecha_hasta) url += `&fecha_hasta=${fecha_hasta}`;
    if (sort) url += `&sort=${sort}`;
    
    if (lat != null && lng != null && radio_km != null) {
      url += `&lat=${lat}&lng=${lng}&radio_km=${radio_km}`;
    }
    return this.http.get<any>(url);
  }

  // Crear el evento
  createEvent(event: CreateEvent) {
    return this.http.post<EventInterface>(`${this.apiUrl}`, event);
  }

  // Obtener eventos de mi amigos
  getEventosDeAmigos() {
    return this.http.get<EventInterface[]>(`${this.apiUrl}/friends`);
  }

  // Obtenemos nuestros eventos
  getMyEvents() {
    return this.http.get<EventInterface[]>(`${this.apiUrl}/my-events`);
  }

  // Obtenerms los eventos en los que participamos
  geteventosEnlosQueParticipamos() {
    return this.http.get<EventInterface[]>(`${this.apiUrl}/participante`)
  }

  // Unirnos a eventos
  joinEvent(idEvento: number) {
    return this.http.post<any>(`${this.apiUrl}/${idEvento}/join`, {});
  }

  // Abandonar un evento
  leaveEvent(idEvento: number) {
    return this.http.delete<any>(`${this.apiUrl}/${idEvento}/leave`);
  }

  // Nostraemos los depoter que hay en la base de datos
  getSports() {
    return this.http.get<any>(`${this.apiUlrSports}`);
  }


  //Actualiza un evento .
  updateEvent(id_evento: number, event: CreateEvent) {
    return this.http.patch<EventInterface>(`${this.apiUrl}/${id_evento}`, event);
  }

  // Funcion que que sirve para elimiar un evento
  delete(id_evento: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id_evento}`);
  }

  // Finalizar un evento manualmente y dar XP
  finalizarEvent(idEvento: number) {
    return this.http.patch<any>(`${this.apiUrl}/${idEvento}/finalizar`, {});
  }
}

