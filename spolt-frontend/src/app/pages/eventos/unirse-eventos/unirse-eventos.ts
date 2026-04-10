// Force TS rebuild
import { Component, inject } from '@angular/core';
import { ListEvents } from '../list-events/list-events';
import { signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../service/eventos.service';
import { EventInterface, eventAction } from '../models/createEvent';

@Component({
  selector: 'app-unirse-eventos',
  imports: [ListEvents, FormsModule],
  templateUrl: './unirse-eventos.html',
  styleUrl: './unirse-eventos.css',
})
export class UnirseEventos {
  private readonly eventService = inject(EventosService)

  tabActiva = signal("public");
  mensajeEnvio=signal('');

  public mostrarModalSalir = signal<boolean>(false);
  public eventoIdParaSalir = signal<number | null>(null);

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

  aplicarFiltros() {
    this.cerrarFiltros();
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
    }
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

