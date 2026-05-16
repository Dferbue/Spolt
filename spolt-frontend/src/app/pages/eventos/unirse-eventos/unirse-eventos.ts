import { Component, inject, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListEvents } from '../list-events/list-events';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../service/eventos.service';
import { EventInterface, eventAction } from '../models/createEvent';
import * as L from 'leaflet';
import { SportColorService } from '../../../shared/services/sport-color.service';
import { GeolocationService } from '../../../shared/services/geolocation.service';
import { CustomCalendar } from '../../../shared/components/custom-calendar/custom-calendar';

@Component({
  selector: 'app-unirse-eventos',
  standalone: true,
  imports: [CommonModule, ListEvents, FormsModule, CustomCalendar],
  templateUrl: './unirse-eventos.html',
  styleUrl: './unirse-eventos.css',
  encapsulation: ViewEncapsulation.None,
})
export class UnirseEventos {
  private readonly eventService = inject(EventosService);
  public readonly sportColorService = inject(SportColorService);
  private readonly geoService = inject(GeolocationService);

  tabActiva = signal("public");
  mensajeEnvio = signal('');

  // Coordenadas del usuario y radio de búsqueda
  private userLat = signal<number | null>(null);
  private userLng = signal<number | null>(null);
  public filtroDistanciaKm = signal<number>(50); // Por defecto 50 km

  // Paginación tab Públicos (server-side)
  public paginaActual = signal<number>(1);
  public totalPaginas = signal<number>(1);
  public totalItems = signal<number>(0);
  public readonly ITEMS_POR_PAGINA = 20;

  // Paginación local tabs Amigos / Unidos
  public paginaAmigos = signal<number>(1);
  public paginaUnidos = signal<number>(1);

  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  public mostrarModalSalir = signal<boolean>(false);
  public eventoIdParaSalir = signal<number | null>(null);

  public mostrarModalDetalles = signal<boolean>(false);
  public eventSelected = signal<EventInterface | null>(null);

  getUserLevel(participante: any, id_deporte: number): number {
    if (!participante?.usuario?.niveles_deportivos) return 1;
    const nivelObj = participante.usuario.niveles_deportivos.find((nd: any) => nd.id_deporte === id_deporte);
    return nivelObj ? nivelObj.nivel : 1;
  }

  // ── FILTROS ──
  public mostrarVentanaDeFiltros = signal<boolean>(false);
  public listaDeportes = signal<any[]>([]);

  // Valores de los filtros
  public filtroDeporte = signal<number | null>(null);
  public filtroTipoEvento = signal<string>('');
  public filtroBusqueda = signal<string>('');
  public filtroPlazasLibres = signal<boolean>(false);
  public filtroFechaDesde = signal<string>('');
  public filtroFechaHasta = signal<string>('');
  public ordenarPor = signal<string>('recientes');

  // Contamos cuántos filtros están activos
  public filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroDeporte()) count++;
    if (this.filtroTipoEvento()) count++;
    if (this.filtroBusqueda()) count++;
    if (this.filtroPlazasLibres()) count++;
    if (this.filtroFechaDesde()) count++;
    if (this.filtroFechaHasta()) count++;
    if (this.filtroDistanciaKm() !== 50) count++; // cuenta si se cambió el radio por defecto
    return count;
  });

  abrirFiltros() {
    // Cargamos la lista de deportes del servidor si aún no los tenemos
    if (this.listaDeportes().length === 0) {
      this.eventService.getSports().subscribe((data: any[]) => this.listaDeportes.set(data || []));
    this.mostrarVentanaDeFiltros.set(true);
    document.body.classList.add('modal-open');
  }

  cerrarFiltros() {
    this.mostrarVentanaDeFiltros.set(false);
    document.body.classList.remove('modal-open');
    this.refreshData();
  }

  limpiarFiltros() {
    this.filtroDeporte.set(null);
    this.filtroTipoEvento.set('');
    this.filtroBusqueda.set('');
    this.filtroPlazasLibres.set(false);
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroDistanciaKm.set(50);
    this.refreshData();
  }



  private aplicarFiltrosBase(eventos: EventInterface[], options?: { soloAbiertos?: boolean; aplicarDistancia?: boolean }): EventInterface[] {
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

    if (options?.soloAbiertos) {
      resultado = resultado.filter(e => e.estado === 'abierto' || !e.estado);
    }

    if (this.filtroPlazasLibres()) {
      resultado = resultado.filter(e => {
        const actuales = e.numero_participantes_actuales || e.participantes_actuales || 0;
        return actuales < e.numero_max_participantes;
      });
    }

    const fechaDesde = this.filtroFechaDesde();
    if (fechaDesde) resultado = resultado.filter(e => new Date(e.fecha_evento) >= new Date(fechaDesde));

    const fechaHasta = this.filtroFechaHasta();
    if (fechaHasta) resultado = resultado.filter(e => new Date(e.fecha_evento) <= new Date(fechaHasta));

    if (options?.aplicarDistancia) {
      const lat = this.userLat();
      const lng = this.userLng();
      const radio = this.filtroDistanciaKm();
      if (lat != null && lng != null && radio != null) {
        resultado = resultado.filter(e => {
          if (e.latitud == null || e.longitud == null) return false;
          const dist = this.geoService.calcularDistancia(lat, lng, e.latitud, e.longitud);
          return dist <= radio;
        });
      }
    }

    return this.ordenarLista(resultado);
  }

  // Función que aplica filtros a listas de eventos disponibles (solo abiertos)
  private aplicarFiltrosALista(eventos: EventInterface[]): EventInterface[] {
    return this.aplicarFiltrosBase(eventos, { soloAbiertos: true, aplicarDistancia: true });
  }

  // Función para la tab de eventos a los que estás unido (sin filtro de estado)
  private aplicarFiltrosUnidos(eventos: EventInterface[]): EventInterface[] {
    return this.aplicarFiltrosBase(eventos, { aplicarDistancia: false });
  }

  private aplicarFiltrosAmigos(eventos: EventInterface[]): EventInterface[] {
    return this.aplicarFiltrosBase(eventos, { soloAbiertos: true, aplicarDistancia: false });
  }

  // Función de ordenación compartida
  private ordenarLista(lista: EventInterface[]): EventInterface[] {
    const orden = this.ordenarPor();
    const resultado = [...lista];
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

  //Funcion que nos dice que lista mostrar
  mostrar(tab: string) {
    this.tabActiva.set(tab);
    this.refreshData();
  }


  // Creamos listas como Signals modificables
  public rawListaEventos = signal<EventInterface[]>([]);
  public rawListEventosAmigos = signal<EventInterface[]>([]);
  public lisEventosEnLosQueParticipamos = signal<EventInterface[]>([]);

  // Computed para saber a qué eventos estamos unidos
  public joinedIds = computed(() => this.lisEventosEnLosQueParticipamos().map(e => Number(e.id_evento || e.id)));

  // Tab Públicos: solo muestra lo que viene del servidor (ya paginado)
  public listaEventos = computed(() =>
    this.rawListaEventos().filter(e => {
      const eventId = Number(e.id_evento || e.id);
      return !this.joinedIds().includes(eventId) && this.isEventStillAvailable(e);
    })
  );

  // Tab Amigos: filtrado + paginación local
  private _amigosBase = computed(() => this.aplicarFiltrosAmigos(
    this.rawListEventosAmigos().filter(e => !this.joinedIds().includes(Number(e.id_evento || e.id)))
  ));
  public totalPaginasAmigos = computed(() => Math.max(1, Math.ceil(this._amigosBase().length / this.ITEMS_POR_PAGINA)));
  public listEventosAmigos = computed(() => {
    const start = (this.paginaAmigos() - 1) * this.ITEMS_POR_PAGINA;
    return this._amigosBase().slice(start, start + this.ITEMS_POR_PAGINA);
  });

  // Tab Unidos: filtrado + paginación local
  private _unidosBase = computed(() => this.aplicarFiltrosUnidos(this.lisEventosEnLosQueParticipamos()));
  public totalPaginasUnidos = computed(() => Math.max(1, Math.ceil(this._unidosBase().length / this.ITEMS_POR_PAGINA)));
  public listaEventosUnidos = computed(() => {
    const start = (this.paginaUnidos() - 1) * this.ITEMS_POR_PAGINA;
    return this._unidosBase().slice(start, start + this.ITEMS_POR_PAGINA);
  });

  // Cargar página específica de eventos públicos (server-side)
  cargarPaginaPublicos(pagina: number) {
    this.paginaActual.set(pagina);

    // Si no se ha podido obtener la ubicación, no cargamos eventos públicos
    if (this.userLat() === null || this.userLng() === null) {
      this.rawListaEventos.set([]);
      this.totalItems.set(0);
      this.totalPaginas.set(1);
      return;
    }

    this.eventService.getAllEvents({
      page: pagina,
      limit: this.ITEMS_POR_PAGINA,
      search: this.filtroBusqueda(),
      id_deporte: this.filtroDeporte() ?? undefined,
      tipo_evento: this.filtroTipoEvento() || undefined,
      fecha_desde: this.filtroFechaDesde() || undefined,
      fecha_hasta: this.filtroFechaHasta() || undefined,
      lat: this.userLat() ?? undefined,
      lng: this.userLng() ?? undefined,
      radio_km: this.filtroDistanciaKm(),
      sort: this.ordenarPor(),
      solo_disponibles: true,
    }).subscribe((res: any) => {
      const data = res?.data || res || [];
      const meta = res?.meta;
      this.rawListaEventos.set(this.enriquecerConDistancia(data));
      if (meta) {
        this.totalItems.set(meta.total || data.length);
        this.totalPaginas.set(meta.totalPages || 1);
      } else {
        // si la respuesta no tiene meta (array plano), calcular
        this.totalItems.set(data.length);
        this.totalPaginas.set(1);
      }
    });
  }

  // Función para volver a traer los datos del servidor sin recargar la página
  refreshData() {
    this.paginaActual.set(1);
    this.cargarPaginaPublicos(1);
    this.eventService.getEventosDeAmigos().subscribe((data: EventInterface[]) => {
      this.rawListEventosAmigos.set(this.enriquecerConDistancia(data || []));
      this.paginaAmigos.set(1);
    });
    this.eventService.geteventosEnlosQueParticipamos().subscribe((data: EventInterface[]) => {
      this.lisEventosEnLosQueParticipamos.set(this.enriquecerConDistancia(data || []));
      this.paginaUnidos.set(1);
    });
  }

  // Helpers de paginación
  irPaginaPublicos(p: number) { if (p >= 1 && p <= this.totalPaginas()) this.cargarPaginaPublicos(p); }
  irPaginaAmigos(p: number) { if (p >= 1 && p <= this.totalPaginasAmigos()) this.paginaAmigos.set(p); }
  irPaginaUnidos(p: number) { if (p >= 1 && p <= this.totalPaginasUnidos()) this.paginaUnidos.set(p); }

  getPagesArray(total: number): number[] { return Array.from({ length: total }, (_, i) => i + 1); }

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

  private isEventStillAvailable(evento: EventInterface): boolean {
    if (evento.estado && evento.estado !== 'abierto') return false;

    const fechaHoraInicio = this.getEventStartDate(evento);
    return fechaHoraInicio.getTime() >= Date.now();
  }

  private getEventStartDate(evento: EventInterface): Date {
    const fecha = new Date(evento.fecha_evento);
    const hora = evento.hora_inicio ? new Date(evento.hora_inicio) : null;

    if (!hora || Number.isNaN(hora.getTime())) {
      return fecha;
    }

    const fechaHora = new Date(fecha);
    fechaHora.setHours(
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      hora.getUTCMilliseconds(),
    );

    return fechaHora;
  }



  //Inizializamos los datos
  constructor(){
    // Obtenemos la ubicación del usuario y luego cargamos los eventos
    this.geoService.getUserLocation(true).then(loc => {
      if (loc) {
        this.userLat.set(loc.lat);
        this.userLng.set(loc.lng);
      }
      this.refreshData();
    });
  }

  //Funcion para unirnos a un evento
  joinEvent(id_evento:number){
    if(!id_evento) return ;

    this.eventService.joinEvent(id_evento).subscribe({
      next:(response: any)=>{
        this.mensajeEnvio.set('✅ Te has unido correctamente a este evento ');
        // Actualizar arrays localmente en vez de refreshData()
        const evento = this.rawListaEventos().find(e => Number(e.id_evento || e.id) === id_evento)
          || this.rawListEventosAmigos().find(e => Number(e.id_evento || e.id) === id_evento);
        if (evento) {
          this.lisEventosEnLosQueParticipamos.update(list => [...list, evento]);
        }
        this.rawListaEventos.update(list =>
          list.filter(e => Number(e.id_evento || e.id) !== id_evento)
        );
        this.rawListEventosAmigos.update(list =>
          list.filter(e => Number(e.id_evento || e.id) !== id_evento)
        );
        setTimeout(() => this.mensajeEnvio.set(''), 3000); 
      },
      error:(err: any)=>{
        this.mensajeEnvio.set('❌ Error al intentar unirte a este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    })
  }

  //Funcion de salirnos de un evento
  leaveEvent(id_evento:number){
    if(!id_evento) return ;

    this.eventService.leaveEvent(id_evento).subscribe({
      next:(response: any)=>{
        this.mensajeEnvio.set('✅ Te has salido correctamente de este evento ');
        // Actualizar arrays localmente en vez de refreshData()
        this.lisEventosEnLosQueParticipamos.update(list => 
          list.filter(e => Number(e.id_evento || e.id) !== id_evento)
        );
        setTimeout(() => this.mensajeEnvio.set(''), 3000); 
      },
      error:(err: any)=>{
        this.mensajeEnvio.set('❌ Error al intentar salirte de este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    })
  }
  

  //Hacempos la fucnionque ara la accion segun el botnd del evento que hayamos elegido
  selectFuntion(data:eventAction){
    const ide = Number(data.evento.id_evento || data.evento.id);
    if(data.action=== "join"){
      this.joinEvent(ide);
    }else if(data.action=== "leave"){
      this.eventoIdParaSalir.set(ide);
      this.mostrarModalSalir.set(true);
      document.body.classList.add('modal-open');
    }else if (data.action === "details") {
      this.eventSelected.set(data.evento);
      this.mostrarModalDetalles.set(true);
      document.body.classList.add('modal-open');
      setTimeout(() => this.initMap(), 200);
    }
  }

  // Lógica Detalles
  cerrarModalDetalles() {
    this.mostrarModalDetalles.set(false);
    this.eventSelected.set(null);
    document.body.classList.remove('modal-open');
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  initMap() {
    const event = this.eventSelected();
    if (!event) return;

    if (this.map) {
      this.map.remove();
    }

    const mapContainer = document.getElementById('map-details');
    if (!mapContainer) return;

    const lat = event.latitud || 40.4168; 
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

  confirmarSalirEvent() {
    const id = this.eventoIdParaSalir();
    if (id) {
      this.leaveEvent(id);
    }
    this.cerrarModalSalir();
  }

  copiarCoordenadas(event: EventInterface) {
    const text = `${event.latitud}, ${event.longitud}`;
    navigator.clipboard.writeText(text).then(() => {
      this.mensajeEnvio.set('✅ Coordenadas copiadas al portapapeles');
      setTimeout(() => this.mensajeEnvio.set(''), 2500);
    });
  }

  cerrarModalSalir() {
    this.mostrarModalSalir.set(false);
    this.eventoIdParaSalir.set(null);
    document.body.classList.remove('modal-open');
  }
}
