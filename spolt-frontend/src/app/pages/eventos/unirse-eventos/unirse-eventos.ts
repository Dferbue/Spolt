import { Component, inject, ViewEncapsulation, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListEvents } from '../list-events/list-events';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../service/eventos.service';
import { EventInterface, eventAction } from '../models/createEvent';
import * as L from 'leaflet';
import { SportColorService } from '../../../shared/services/sport-color.service';

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

  tabActiva = signal("public");
  mensajeEnvio = signal('');

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



  // Función que aplica filtros a listas de eventos disponibles (solo abiertos)
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

    // Solo eventos abiertos
    resultado = resultado.filter(e => e.estado === 'abierto' || !e.estado);

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

    return this.ordenarLista(resultado);
  }

  // Función para la tab de eventos a los que estás unido (sin filtro de estado)
  private aplicarFiltrosUnidos(eventos: EventInterface[]): EventInterface[] {
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

    const fechaDesde = this.filtroFechaDesde();
    if (fechaDesde) resultado = resultado.filter(e => new Date(e.fecha_evento) >= new Date(fechaDesde));

    const fechaHasta = this.filtroFechaHasta();
    if (fechaHasta) resultado = resultado.filter(e => new Date(e.fecha_evento) <= new Date(fechaHasta));

    return this.ordenarLista(resultado);
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
  public listaEventosUnidos = computed(() => this.aplicarFiltrosUnidos(
    this.lisEventosEnLosQueParticipamos()
  ));

  // Función para volver a traer los datos del servidor sin recargar la página
  refreshData() {
    this.eventService.getAllEvents().subscribe((res: any) => {
      const data = res?.data || res || [];
      this.rawListaEventos.set(data);
    });
    this.eventService.getEventosDeAmigos().subscribe((data: EventInterface[]) => this.rawListEventosAmigos.set(data || []));
    this.eventService.geteventosEnlosQueParticipamos().subscribe((data: EventInterface[]) => this.lisEventosEnLosQueParticipamos.set(data || []));
  }



  //Inizializamos los datos
  constructor(){
    this.refreshData();
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
