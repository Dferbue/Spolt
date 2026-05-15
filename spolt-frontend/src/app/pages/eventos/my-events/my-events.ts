import { Component, inject, OnInit, signal, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService } from '../service/eventos.service';
import { CreateEvent, EventInterface, eventAction } from '../models/createEvent';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ListEvents } from '../list-events/list-events';
import { SportColorService } from '../../../shared/services/sport-color.service';
import { GeolocationService } from '../../../shared/services/geolocation.service';
import { CustomCalendar } from '../../../shared/components/custom-calendar/custom-calendar';
import { LocationPicker, LocationData } from '../../../shared/components/location-picker/location-picker';
import { CustomTimePicker } from '../../../shared/components/custom-time-picker/custom-time-picker';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, ListEvents, FormsModule, CustomCalendar, LocationPicker, CustomTimePicker],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css',
  encapsulation: ViewEncapsulation.None,
})
export class MyEvents implements OnInit {
  private readonly eventService = inject(EventosService);
  public readonly sportColorService = inject(SportColorService);
  private readonly geoService = inject(GeolocationService);

  public tabActiva = signal<'creados' | 'unidos'>('creados');
  public mensajeEnvio = signal('');
  public loading = signal<boolean>(true);

  // Coordenadas del usuario
  private userLat = signal<number | null>(null);
  private userLng = signal<number | null>(null);

  public rawMyEvents = signal<EventInterface[]>([]);
  public rawJoinedEvents = signal<EventInterface[]>([]);
  public joinedIds = signal<number[]>([]);

  getUserLevel(participante: any, id_deporte: number): number {
    if (!participante?.usuario?.niveles_deportivos) return 1;
    const nivelObj = participante.usuario.niveles_deportivos.find((nd: any) => nd.id_deporte === id_deporte);
    return nivelObj ? nivelObj.nivel : 1;
  }

  // ── FILTROS (Espejo de unirse-eventos) ──
  public mostrarVentanaDeFiltros = signal<boolean>(false);
  public filtroDeporte = signal<number | null>(null);
  public filtroTipoEvento = signal<string>('');
  public filtroBusqueda = signal<string>('');
  public filtroPlazasLibres = signal<boolean>(false);
  public filtroFechaDesde = signal<string>('');
  public filtroFechaHasta = signal<string>('');
  public filtroDistanciaKm = signal<number>(250); // Por defecto 250 km en mis eventos para verlos todos casi siempre
  public ordenarPor = signal<string>('recientes');

  public filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroDeporte()) count++;
    if (this.filtroTipoEvento()) count++;
    if (this.filtroBusqueda()) count++;
    if (this.filtroPlazasLibres()) count++;
    if (this.filtroFechaDesde()) count++;
    if (this.filtroFechaHasta()) count++;
    if (this.filtroDistanciaKm() !== 250) count++;
    return count;
  });

  private aplicarFiltrosALista(eventos: EventInterface[]): EventInterface[] {
    let resultado = eventos;
    const busqueda = this.filtroBusqueda().toLowerCase().trim();
    if (busqueda) {
      resultado = resultado.filter(e =>
        e.titulo.toLowerCase().includes(busqueda) ||
        (e.ubicacion && e.ubicacion.toLowerCase().includes(busqueda)) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(busqueda))
      );
    }
    const deporte = this.filtroDeporte();
    if (deporte) resultado = resultado.filter(e => e.id_deporte === deporte);
    
    const tipo = this.filtroTipoEvento();
    if (tipo) resultado = resultado.filter(e => e.tipo_evento === tipo);

    if (this.filtroPlazasLibres()) {
      resultado = resultado.filter(e => {
        const actuales = e.numero_participantes_actuales || e.participantes_actuales || 0;
        return actuales < e.numero_max_participantes;
      });
    }
    if (this.filtroFechaDesde()) {
      resultado = resultado.filter(e => new Date(e.fecha_evento) >= new Date(this.filtroFechaDesde()));
    }
    if (this.filtroFechaHasta()) {
      resultado = resultado.filter(e => new Date(e.fecha_evento) <= new Date(this.filtroFechaHasta()));
    }
    const distMax = this.filtroDistanciaKm();
    if (distMax && distMax < 250) {
      resultado = resultado.filter(e => e.distancia != null && e.distancia <= distMax);
    }
    // Ordenación
    const orden = this.ordenarPor();
    resultado = [...resultado]; // Copia para no mutar el original y forzar reactividad
    
    if (orden === 'recientes') {
      resultado.sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime());
    } else if (orden === 'antiguos') {
      resultado.sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());
    } else if (orden === 'titulo') {
      resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (orden === 'deporte') {
      resultado.sort((a, b) => (a.deporte?.nombre || a.nombre_deporte || '').localeCompare(b.deporte?.nombre || b.nombre_deporte || ''));
    } else if (orden === 'estado') {
      resultado.sort((a, b) => (a.estado || '').localeCompare(b.estado || ''));
    } else if (orden === 'creacion') {
      resultado.sort((a, b) => {
        const dateA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
        const dateB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
        return dateB - dateA;
      });
    } else if (orden === 'cercanos') {
      const lat = this.userLat();
      const lng = this.userLng();
      if (lat != null && lng != null) {
        resultado.sort((a, b) => {
          const distA = (a.latitud && a.longitud) ? this.geoService.calcularDistancia(lat, lng, a.latitud, a.longitud) : 99999;
          const distB = (b.latitud && b.longitud) ? this.geoService.calcularDistancia(lat, lng, b.latitud, b.longitud) : 99999;
          return distA - distB;
        });
      }
    }

    return resultado;
  }

  // Señales filtradas para la vista (paginadas)
  public myEvents = computed(() => {
    const start = (this.paginaCreados() - 1) * this.ITEMS_POR_PAGINA;
    return this._creadosBase().slice(start, start + this.ITEMS_POR_PAGINA);
  });
  public joinedEvents = computed(() => {
    const start = (this.paginaUnidos() - 1) * this.ITEMS_POR_PAGINA;
    return this._unidosBase().slice(start, start + this.ITEMS_POR_PAGINA);
  });


  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  // Modales
  public mostrarModalEliminar = signal<boolean>(false);
  public eventoIdParaEliminar = signal<number | null>(null);
  
  public mostrarModalFinalizar = signal<boolean>(false);
  public eventoIdParaFinalizar = signal<number | null>(null);

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

  // Paginación
  public readonly ITEMS_POR_PAGINA = 20;
  public paginaCreados = signal<number>(1);
  public paginaUnidos = signal<number>(1);

  private _creadosBase = computed(() => this.aplicarFiltrosALista(this.rawMyEvents()));
  private _unidosBase = computed(() => this.aplicarFiltrosALista(this.rawJoinedEvents()));

  public totalPaginasCreados = computed(() => Math.max(1, Math.ceil(this._creadosBase().length / this.ITEMS_POR_PAGINA)));
  public totalPaginasUnidos = computed(() => Math.max(1, Math.ceil(this._unidosBase().length / this.ITEMS_POR_PAGINA)));

  irPaginaCreados(p: number) { if (p >= 1 && p <= this.totalPaginasCreados()) this.paginaCreados.set(p); }
  irPaginaUnidos(p: number) { if (p >= 1 && p <= this.totalPaginasUnidos()) this.paginaUnidos.set(p); }
  getPagesArray(total: number): number[] { return Array.from({ length: total }, (_, i) => i + 1); }
  
  public edit_ubicacion = signal<string>('');
  public edit_latitud = signal<number | null>(null);
  public edit_longitud = signal<number | null>(null);
  public mostrarMapaEdicion = signal<boolean>(false);

  abrirMapaEdicion() {
    this.mostrarMapaEdicion.set(true);
  }

  cerrarMapaEdicion() {
    this.mostrarMapaEdicion.set(false);
  }

  onEditLocationChange(location: LocationData) {
    this.edit_latitud.set(location.lat);
    this.edit_longitud.set(location.lng);
    this.edit_ubicacion.set(location.address);
  }

  ngOnInit() {
    // Primero obtenemos la ubicación del usuario y luego cargamos los eventos
    this.geoService.getUserLocation(true).then(loc => {
      if (loc) {
        this.userLat.set(loc.lat);
        this.userLng.set(loc.lng);
      }
      this.refreshData();
    });
  }

  refreshData() {
    this.loading.set(true);
    
    // Cargar eventos creados por mí
    this.eventService.getMyEvents().subscribe({
      next: (data: EventInterface[]) => {
        this.rawMyEvents.set(this.enriquecerConDistancia(data || []));
        this.checkLoading();
      },
      error: (err: any) => {
        console.error('Error fetching my events:', err);
        this.checkLoading();
      }
    });

    // Cargar eventos a los que me he unido
    this.eventService.geteventosEnlosQueParticipamos().subscribe({
      next: (data: EventInterface[]) => {
        this.rawJoinedEvents.set(this.enriquecerConDistancia(data || []));
        this.joinedIds.set(data?.map(e => Number(e.id_evento || e.id)) || []);
        this.checkLoading();
      },
      error: (err: any) => {
        console.error('Error fetching joined events:', err);
        this.checkLoading();
      }
    });
  }

  private enriquecerConDistancia(eventos: EventInterface[]): EventInterface[] {
    const lat = this.userLat();
    const lng = this.userLng();
    if (lat == null || lng == null) return eventos;
    return eventos.map(e => ({
      ...e,
      distancia: (e.latitud != null && e.longitud != null)
        ? this.geoService.calcularDistancia(lat, lng, e.latitud, e.longitud)
        : undefined
    }));
  }

  private checkLoading() {
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
      setTimeout(() => this.initMap(), 200); 
    } else if (data.action === 'edit') {
      this.abrirEdicionDirecta(data.evento);
    } else if (data.action === 'join') {
      this.joinEvent(ide);
    } else if (data.action === 'finalizar') {
      this.eventoIdParaFinalizar.set(ide);
      this.mostrarModalFinalizar.set(true);
    }
  }

  // Lógica Filtros
  abrirFiltros() {
    if (this.listaDeportes().length === 0) {
      this.eventService.getSports().subscribe((sports: any[]) => this.listaDeportes.set(sports || []));
    }
    this.mostrarVentanaDeFiltros.set(true);
  }

  cerrarFiltros() {
    this.mostrarVentanaDeFiltros.set(false);
  }

  limpiarFiltros() {
    this.filtroDeporte.set(null);
    this.filtroTipoEvento.set('');
    this.filtroBusqueda.set('');
    this.filtroPlazasLibres.set(false);
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroDistanciaKm.set(250);
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

    this.edit_ubicacion.set(event.ubicacion || '');
    this.edit_latitud.set(event.latitud);
    this.edit_longitud.set(event.longitud);

    // Load sports
    if (this.listaDeportes().length === 0) {
      this.eventService.getSports().subscribe((sports: any[]) => this.listaDeportes.set(sports || []));
    }

    this.mostrarModalEditar.set(true);
  }

  initMap() {
    const event = this.eventSelected();
    if (!event) return;

    if (this.map) {
      this.map.remove();
    }

    const mapContainer = document.getElementById('map-details-my');
    if (!mapContainer) return;

    const lat = event.latitud || 40.4168; 
    const lng = event.longitud || -3.7038;

    this.map = L.map('map-details-my').setView([lat, lng], 17);

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
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(mapContainer);

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
      ubicacion: this.edit_ubicacion() || undefined,
      latitud: this.edit_latitud() ?? undefined,
      longitud: this.edit_longitud() ?? undefined,
    };

    this.eventService.updateEvent(id, data).subscribe({
      next: () => {
        this.mensajeEnvio.set('✅ Evento actualizado correctamente');
        this.cerrarModalEditar();
        this.refreshData();
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (err: any) => {
        this.mensajeEnvio.set('❌ Error al actualizar el evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  onEditComplete() {
    this.refreshData();
  }

  // Lógica Eliminación y Finalización
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

  confirmarFinalizar() {
    const id = this.eventoIdParaFinalizar();
    if (id) {
      this.finalizarEvent(id);
    }
    this.cerrarModalFinalizar();
  }

  cerrarModalFinalizar() {
    this.mostrarModalFinalizar.set(false);
    this.eventoIdParaFinalizar.set(null);
  }

  deleteEvent(id_evento: number) {
    this.eventService.delete(id_evento).subscribe({
      next: (response: any) => {
        this.mensajeEnvio.set('✅ Se ha eliminado este evento correctamente');
        // Actualizar localmente en vez de refreshData()
        this.rawMyEvents.update(list => list.filter(e => Number(e.id_evento || e.id) !== id_evento));
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (e: any) => {
        this.mensajeEnvio.set('❌ Error al intentar eliminar este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  finalizarEvent(id_evento: number) {
    this.eventService.finalizarEvent(id_evento).subscribe({
      next: (response: any) => {
        this.mensajeEnvio.set('✅ Evento finalizado y XP repartida correctamente');
        // Actualizar localmente: marcar como finalizado
        this.rawMyEvents.update(list => list.map(e => 
          Number(e.id_evento || e.id) === id_evento ? { ...e, estado: 'finalizado' } : e
        ));
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (e: any) => {
        const msg = e?.error?.message || 'Error al intentar finalizar este evento';
        this.mensajeEnvio.set(`❌ ${msg}`);
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  leaveEvent(id_evento: number) {
    this.eventService.leaveEvent(id_evento).subscribe({
      next: (response: any) => {
        this.mensajeEnvio.set('✅ Te has salido correctamente de este evento');
        // Actualizar localmente
        this.rawJoinedEvents.update(list => list.filter(e => Number(e.id_evento || e.id) !== id_evento));
        this.joinedIds.update(ids => ids.filter(id => id !== id_evento));
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (err: any) => {
        this.mensajeEnvio.set('❌ Error al intentar salir de este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  joinEvent(id_evento: number) {
    this.eventService.joinEvent(id_evento).subscribe({
      next: (response: any) => {
        this.mensajeEnvio.set('✅ Te has unido correctamente a este evento');
        // Actualizar localmente
        const evento = this.rawMyEvents().find(e => Number(e.id_evento || e.id) === id_evento);
        if (evento) {
          this.rawJoinedEvents.update(list => [...list, evento]);
          this.joinedIds.update(ids => [...ids, id_evento]);
        }
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (err: any) => {
        this.mensajeEnvio.set('❌ Error al intentar unirte a este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  copiarCoordenadas(event: EventInterface) {
    const text = `${event.latitud}, ${event.longitud}`;
    navigator.clipboard.writeText(text).then(() => {
      this.mensajeEnvio.set('✅ Coordenadas copiadas al portapapeles');
      setTimeout(() => this.mensajeEnvio.set(''), 2500);
    });
  }

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
