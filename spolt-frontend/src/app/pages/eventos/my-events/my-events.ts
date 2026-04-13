import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService } from '../service/eventos.service';
import { CreateEvent, TipoEvento, EventInterface, eventAction } from '../models/createEvent';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ListEvents } from '../list-events/list-events';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, ListEvents, FormsModule],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css',
  encapsulation: ViewEncapsulation.None,
})
export class MyEvents implements OnInit {
  private readonly eventService = inject(EventosService);

  public tabActiva = signal<'creados' | 'unidos'>('creados');
  public mensajeEnvio = signal('');
  public loading = signal<boolean>(true);

  public myEvents = signal<EventInterface[]>([]);
  public joinedEvents = signal<EventInterface[]>([]);
  public joinedIds = signal<number[]>([]);

  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  // Modales
  public mostrarModalEliminar = signal<boolean>(false);
  public eventoIdParaEliminar = signal<number | null>(null);
  
  public mostrarModalDetalles = signal<boolean>(false);
  public eventSelected = signal<EventInterface | null>(null);
  
  public mostrarModalEditar = signal<boolean>(false);

  // Campos Edición Local
  public listaDeportes = signal<any[]>([]);
  public edit_titulo = '';
  public edit_descripcion = '';
  public edit_id_deporte: number | null = null;
  public edit_fecha_evento = '';
  public edit_hora_inicio = '';
  public edit_hora_fin = '';
  public edit_numero_max_participantes: number | null = null;

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loading.set(true);
    
    // Cargar eventos creados por mí
    this.eventService.getMyEvents().subscribe({
      next: (data) => {
        this.myEvents.set(data || []);
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error fetching my events:', err);
        this.checkLoading();
      }
    });

    // Cargar eventos a los que me he unido
    this.eventService.geteventosEnlosQueParticipamos().subscribe({
      next: (data) => {
        this.joinedEvents.set(data || []);
        this.joinedIds.set(data?.map(e => Number(e.id_evento || e.id)) || []);
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error fetching joined events:', err);
        this.checkLoading();
      }
    });
  }

  private checkLoading() {
    // Si ambas peticiones han terminado (podríamos usar forkJoin pero esto es más simple con signals)
    this.loading.set(false);
  }

  cambiarTab(tab: 'creados' | 'unidos') {
    this.tabActiva.set(tab);
  }

  handleEventAction(data: eventAction) {
    const ide = Number(data.evento.id_evento || data.evento.id);
    
    if (data.action === 'delete') {
      this.eventoIdParaEliminar.set(ide);
      this.mostrarModalEliminar.set(true);
    } else if (data.action === 'leave') {
      this.leaveEvent(ide);
    } else if (data.action === 'details') {
      this.eventSelected.set(data.evento);
      this.mostrarModalDetalles.set(true);
      setTimeout(() => this.initMap(), 50); // Pequeño retraso para que el DOM se actualice
    } else if (data.action === 'edit') {
      this.abrirEdicionDirecta(data.evento);
    }
  }

  // Lógica Detalles
  cerrarModalDetalles() {
    this.mostrarModalDetalles.set(false);
    this.eventSelected.set(null);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  abrirEdicionDirecta(event: EventInterface) {
    this.eventSelected.set(event);
    
    // Prefill fields
    this.edit_titulo = event.titulo;
    this.edit_descripcion = event.descripcion || '';
    this.edit_id_deporte = event.id_deporte;
    this.edit_fecha_evento = event.fecha_evento.split('T')[0];
    
    // Formatear hora
    if (event.hora_inicio.includes('T')) {
      const date = new Date(event.hora_inicio);
      const pad = (n: number) => n < 10 ? '0' + n : n;
      this.edit_hora_inicio = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
    } else {
      this.edit_hora_inicio = event.hora_inicio.substring(0, 5);
    }

    if (event.hora_fin) {
      if (event.hora_fin.includes('T')) {
        const date = new Date(event.hora_fin);
        const pad = (n: number) => n < 10 ? '0' + n : n;
        this.edit_hora_fin = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
      } else {
        this.edit_hora_fin = event.hora_fin.substring(0, 5);
      }
    } else {
      this.edit_hora_fin = '';
    }

    this.edit_numero_max_participantes = event.numero_max_participantes;

    // Load sports
    if (this.listaDeportes().length === 0) {
      this.eventService.getSports().subscribe(sports => this.listaDeportes.set(sports || []));
    }

    this.mostrarModalEditar.set(true);
  }

  initMap() {
    const event = this.eventSelected();
    if (!event) return;

    if (this.map) {
      this.map.remove();
    }

    const mapContainer = document.getElementById('map-details');
    if (!mapContainer) return;

    const lat = event.latitud || 40.4168; // Default Madrid si no hay lat
    const lng = event.longitud || -3.7038;

    this.map = L.map('map-details').setView([lat, lng], 17);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
    }).addTo(this.map);

    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([lat, lng], { icon: redIcon }).addTo(this.map)
      .bindPopup(`<b>${event.titulo}</b><br>${event.ubicacion || 'Ubicación por defecto'}`)
      .openPopup();
    
    // ResizeObserver soluciona definitivamente el problema de renderizado oculto
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(mapContainer);

    // Fallback inicial
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  // Lógica Edición
  cerrarModalEditar() {
    this.mostrarModalEditar.set(false);
    this.eventSelected.set(null);
  }

  guardarCambiosEdicion() {
    const event = this.eventSelected();
    if (!event) return;

    const id = Number(event.id_evento || event.id);
    
    const data: CreateEvent = {
      titulo: this.edit_titulo,
      descripcion: this.edit_descripcion || undefined,
      id_deporte: this.edit_id_deporte!,
      tipo_evento: event.tipo_evento,
      fecha_evento: this.edit_fecha_evento,
      hora_inicio: this.edit_hora_inicio,
      hora_fin: this.edit_hora_fin || undefined,
      numero_max_participantes: this.edit_numero_max_participantes!,
    };

    this.eventService.updateEvent(id, data).subscribe({
      next: () => {
        this.mensajeEnvio.set('✅ Evento actualizado correctamente');
        this.cerrarModalEditar();
        this.refreshData();
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: () => {
        this.mensajeEnvio.set('❌ Error al actualizar el evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  onEditComplete() {
    this.refreshData();
  }

  // Lógica Eliminación
  confirmarEliminar() {
    const id = this.eventoIdParaEliminar();
    if (id) {
      this.deleteEvent(id);
    }
    this.cerrarModalEliminar();
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar.set(false);
    this.eventoIdParaEliminar.set(null);
  }

  deleteEvent(id_evento: number) {
    this.eventService.delete(id_evento).subscribe({
      next: (response) => {
        this.mensajeEnvio.set('✅ Se ha eliminado este evento correctamente');
        this.refreshData();
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (e) => {
        this.mensajeEnvio.set('❌ Error al intentar eliminar este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  leaveEvent(id_evento: number) {
    this.eventService.leaveEvent(id_evento).subscribe({
      next: (response) => {
        this.mensajeEnvio.set('✅ Te has salido correctamente de este evento');
        this.refreshData();
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (err) => {
        this.mensajeEnvio.set('❌ Error al intentar salir de este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  // Helper para formatear la hora en la vista de detalles
  formatTime(time: string | null | undefined): string {
    if (!time) return '--:--';
    if (time.includes('T')) {
      const date = new Date(time);
      const pad = (n: number) => n < 10 ? '0' + n : n;
      return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
    }
    return time.substring(0, 5);
  }
}
