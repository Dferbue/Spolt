import { Component, inject, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListEvents } from '../list-events/list-events';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../service/eventos.service';
import { EventInterface, eventAction } from '../models/createEvent';
import * as L from 'leaflet';

@Component({
  selector: 'app-unirse-eventos',
  standalone: true,
  imports: [CommonModule, ListEvents, FormsModule],
  templateUrl: './unirse-eventos.html',
  styleUrl: './unirse-eventos.css',
  encapsulation: ViewEncapsulation.None,
})
export class UnirseEventos {
  private readonly eventService = inject(EventosService)

  tabActiva = signal("public");
  mensajeEnvio = signal('');

  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  public mostrarModalSalir = signal<boolean>(false);
  public eventoIdParaSalir = signal<number | null>(null);

  public mostrarModalDetalles = signal<boolean>(false);
  public eventSelected = signal<EventInterface | null>(null);

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

  // Contamos cuántos filtros están activos
  public filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroDeporte()) count++;
    if (this.filtroTipoEvento()) count++;
    if (this.filtroBusqueda()) count++;
    if (this.filtroPlazasLibres()) count++;
    if (this.filtroFechaDesde()) count++;
    if (this.filtroFechaHasta()) count++;
    return count;
  });

  abrirFiltros() {
    // Cargamos la lista de deportes del servidor si aún no los tenemos
    if (this.listaDeportes().length === 0) {
      this.eventService.getSports().subscribe((data: any[]) => this.listaDeportes.set(data || []));
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
  }



  // Función genérica que aplica los filtros a cualquier lista de eventos
  private aplicarFiltrosALista(eventos: EventInterface[]): EventInterface[] {
    let resultado = eventos;

    // Filtro por búsqueda de texto (título, ubicación, descripción)
    const busqueda = this.filtroBusqueda().toLowerCase().trim();
    if (busqueda) {
      resultado = resultado.filter(e =>
        e.titulo.toLowerCase().includes(busqueda) ||
        (e.ubicacion && e.ubicacion.toLowerCase().includes(busqueda)) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por deporte
    const deporte = this.filtroDeporte();
    if (deporte) {
      resultado = resultado.filter(e => e.id_deporte === deporte);
    }

    // Filtro por tipo de evento (partido / torneo)
    const tipo = this.filtroTipoEvento();
    if (tipo) {
      resultado = resultado.filter(e => e.tipo_evento === tipo);
    }

    // Solo mostrar eventos abiertos
    resultado = resultado.filter(e => e.estado === 'abierto' || !e.estado);

    // Filtro por plazas libres
    if (this.filtroPlazasLibres()) {
      resultado = resultado.filter(e => {
        const actuales = e.numero_participantes_actuales || e.participantes_actuales || 0;
        return actuales < e.numero_max_participantes;
      });
    }

    // Filtro por fecha desde
    const fechaDesde = this.filtroFechaDesde();
    if (fechaDesde) {
      resultado = resultado.filter(e => new Date(e.fecha_evento) >= new Date(fechaDesde));
    }

    // Filtro por fecha hasta
    const fechaHasta = this.filtroFechaHasta();
    if (fechaHasta) {
      resultado = resultado.filter(e => new Date(e.fecha_evento) <= new Date(fechaHasta));
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

  public listaEventos = computed(() => this.aplicarFiltrosALista(
    this.rawListaEventos().filter(e => !this.joinedIds().includes(Number(e.id_evento || e.id)))
  ));
  public listEventosAmigos = computed(() => this.aplicarFiltrosALista(
    this.rawListEventosAmigos().filter(e => !this.joinedIds().includes(Number(e.id_evento || e.id)))
  ));

  // Función para volver a traer los datos del servidor sin recargar la página
  refreshData() {
    this.eventService.getAllEvents().subscribe(data=>this.rawListaEventos.set(data || []))
    this.eventService.getEventosDeAmigos().subscribe(data => this.rawListEventosAmigos.set(data || []));
    this.eventService.geteventosEnlosQueParticipamos().subscribe(data => this.lisEventosEnLosQueParticipamos.set(data || []));
  }



  //Inizializamos los datos
  constructor(){
    this.refreshData();
  }

  //Funcion para unirnos a un evento
  joinEvent(id_evento:number){
    //En el caso de que no exista el id del evento no hagas nada
    if(!id_evento) return ;

    //Llamamos a la funcion que no unira al evento 
    this.eventService.joinEvent(id_evento).subscribe({
      next:(response)=>{
        this.mensajeEnvio.set('✅ Te has unido correctamente a este evento ');
        this.refreshData() //Recargamos para que nos salga en la ventana de los evetos en los que estamos unidos
        setTimeout(() => this.mensajeEnvio.set(''), 3000); //Esto es para que se cierre a los 3 segundos
      },
      error:(err)=>{
        this.mensajeEnvio.set('❌ Error al intentar unirte a este evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    })
  }

  //Funcion de salirnos de un evento
  leaveEvent(id_evento:number){
    if(!id_evento) return ;

    //Llamamos al servicio para salrinos del evento
    this.eventService.leaveEvent(id_evento).subscribe({
      next:(response)=>{
        this.mensajeEnvio.set('✅ Te has salido correctamente a este evento ');
        this.refreshData() //Recargamos para que nos salga en la ventana de los evetos en los que estamos unidos
        setTimeout(() => this.mensajeEnvio.set(''), 3000); //Esto es para que se cierre a los 3 segundos
      },
      error:(err)=>{
        this.mensajeEnvio.set('❌ Error al intentar salirte a este evento');
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
    }else if (data.action === "details") {
      this.eventSelected.set(data.evento);
      this.mostrarModalDetalles.set(true);
      setTimeout(() => this.initMap(), 50);
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

  cerrarModalSalir() {
    this.mostrarModalSalir.set(false);
    this.eventoIdParaSalir.set(null);
  }
}

