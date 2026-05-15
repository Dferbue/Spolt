import { Component, inject, OnInit, signal, computed, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { List } from '../list/list';
import { TargetAction } from '../target/target';
import * as L from 'leaflet';
import { GeolocationService } from '../../../shared/services/geolocation.service';

import { CustomCalendar } from '../../../shared/components/custom-calendar/custom-calendar';
import { FormsModule } from '@angular/forms';
import { SportColorService } from '../../../shared/services/sport-color.service';

@Component({
  selector: 'app-eventos-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, List, CustomCalendar, FormsModule],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private geoService = inject(GeolocationService);
  private renderer = inject(Renderer2);
  public sportColorService = inject(SportColorService);
  
  public eventosFiltrados = signal<any[]>([]);
  public listaDeportes = signal<any[]>([]);
  public loading = false;

  // Coordenadas del usuario
  private userLat = signal<number | null>(null);
  private userLng = signal<number | null>(null);

  // Detalles Evento
  public mostrarModalDetalles = signal<boolean>(false);
  public eventSelected = signal<any | null>(null);

  // Confirmar Eliminación
  public mostrarConfirmacionEliminar = signal<boolean>(false);
  public eventoAEliminar = signal<any | null>(null);
  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  // Paginación
  public paginaActual = signal<number>(1);
  public totalPaginas = signal<number>(1);
  public totalItems = signal<number>(0);
  public itemsPorPagina = 20;

  // Filtros
  public mostrarVentanaDeFiltros = signal<boolean>(false);
  public filtroBusqueda = signal<string>('');
  public filtroEstado = signal<string>('');
  public filtroDeporte = signal<string>('');
  public filtroFechaDesde = signal<string>('');
  public filtroFechaHasta = signal<string>('');
  public ordenarPor = signal<string>('recientes');

  public filtrosActivosCount = computed(() => {
    let count = 0;
    if (this.filtroBusqueda().trim()) count++;
    if (this.filtroEstado()) count++;
    if (this.filtroDeporte()) count++;
    if (this.filtroFechaDesde()) count++;
    if (this.filtroFechaHasta()) count++;
    return count;
  });

  public meses = [
    { value: '01', name: 'Enero' }, { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' }, { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' }, { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' }, { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' }, { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' }, { value: '12', name: 'Diciembre' }
  ];

  public anios = ['2024', '2025', '2026'];

  ngOnInit() {
    this.geoService.getUserLocation(true).then(loc => {
      if (loc) {
        this.userLat.set(loc.lat);
        this.userLng.set(loc.lng);
      }
      this.loadEventos();
    }).catch(() => {
      this.loadEventos();
    });
    this.loadDeportes();
  }

  loadEventos() {
    this.loading = true;
    this.cdr.detectChanges();

    const params = {
      page: this.paginaActual(),
      limit: this.itemsPorPagina,
      search: this.filtroBusqueda(),
      estado: this.filtroEstado(),
      id_deporte: this.filtroDeporte(),
      fecha_desde: this.filtroFechaDesde(),
      fecha_hasta: this.filtroFechaHasta(),
      sort: this.ordenarPor(),
      lat: this.userLat() ?? undefined,
      lng: this.userLng() ?? undefined
    };

    this.adminService.getEventosList(params).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.eventosFiltrados.set(res.data);
          this.totalItems.set(res.meta?.total || res.data.length);
          this.totalPaginas.set(res.meta?.totalPages || Math.ceil(this.totalItems() / this.itemsPorPagina));
        } else if (Array.isArray(res)) {
          this.eventosFiltrados.set(res);
          this.totalItems.set(res.length);
          this.totalPaginas.set(1);
        } else {
          this.eventosFiltrados.set([]);
          this.totalItems.set(0);
          this.totalPaginas.set(1);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando eventos:', err);
        this.eventosFiltrados.set([]);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDeportes() {
    this.adminService.getTotalDeportesList().subscribe({
      next: (res: any[]) => this.listaDeportes.set(res),
      error: (err: any) => console.error('Error deportes:', err)
    });
  }

  getUserLevel(participante: any, id_deporte: number): number {
    if (!participante?.usuario?.niveles_deportivos) return 1;
    const nivelObj = participante.usuario.niveles_deportivos.find((nd: any) => nd.id_deporte === id_deporte);
    return nivelObj ? nivelObj.nivel : 1;
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
      this.loadEventos();
    }
  }

  onOrderChange(val: string) {
    this.ordenarPor.set(val);
    this.paginaActual.set(1);
    this.loadEventos();
  }

  aplicarFiltros() {
    this.paginaActual.set(1);
    this.loadEventos();
    this.cerrarFiltros();
  }

  abrirFiltros() { 
    this.mostrarVentanaDeFiltros.set(true); 
    this.renderer.addClass(document.body, 'modal-open');
  }
  cerrarFiltros() { 
    this.mostrarVentanaDeFiltros.set(false); 
    this.renderer.removeClass(document.body, 'modal-open');
  }
  
  limpiarFiltros() {
    this.filtroBusqueda.set('');
    this.filtroEstado.set('');
    this.filtroDeporte.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.paginaActual.set(1);
    this.loadEventos();
  }

  // Recibe acciones del hijo (list -> target)
  handleItemAction(event: TargetAction) {
    const item = event.item;
    switch (event.action) {
      case 'detalles':
        this.eventSelected.set(item);
        this.mostrarModalDetalles.set(true);
        this.renderer.addClass(document.body, 'modal-open');
        setTimeout(() => this.initMap(), 500);
        break;
      case 'eliminar':
        this.eventoAEliminar.set(item);
        this.mostrarConfirmacionEliminar.set(true);
        this.renderer.addClass(document.body, 'modal-open');
        break;
    }
  }

  copiarCoordenadas(event: any) {
    const text = `${event.latitud}, ${event.longitud}`;
    navigator.clipboard.writeText(text).then(() => {
      // Usar un alert simple o si hay mensajeEnvio...
      // Veo que admin no tiene mensajeEnvio signal como unirse-eventos
      alert('✅ Coordenadas copiadas al portapapeles');
    });
  }

  cerrarModalDetalles() {
    this.mostrarModalDetalles.set(false);
    this.eventSelected.set(null);
    this.renderer.removeClass(document.body, 'modal-open');
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

    const mapContainer = document.getElementById('map-admin-details');
    if (!mapContainer) return;

    const lat = event.latitud || 40.4168; 
    const lng = event.longitud || -3.7038;

    this.map = L.map('map-admin-details').setView([lat, lng], 17);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OSM'
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
      .bindPopup(`<b>${event.titulo}</b><br>${event.ubicacion || 'Ubicación'}`)
      .openPopup();
    
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(mapContainer);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 500);
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

  cerrarConfirmacionEliminar() {
    this.mostrarConfirmacionEliminar.set(false);
    this.eventoAEliminar.set(null);
    this.renderer.removeClass(document.body, 'modal-open');
  }

  confirmarEliminarEvento() {
    const item = this.eventoAEliminar();
    if (item) {
      console.log('Eliminando evento:', item.id_evento);
      this.adminService.deleteEvento(item.id_evento).subscribe({
        next: () => {
          this.loadEventos();
          this.cerrarConfirmacionEliminar();
        },
        error: (err: any) => console.error('Error eliminando evento', err)
      });
    }
  }
}
