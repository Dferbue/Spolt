import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventosService } from '../eventos/service/eventos.service';
import { AuthService } from '../../auth/services/auth.service';
import { catchError } from 'rxjs';
import * as L from 'leaflet';
import { SportColorService } from '../../shared/services/sport-color.service';

@Component({
  selector: 'app-invite-event',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invite-event.html',
  styleUrls: ['./invite-event.css']
})
export class InviteEventPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventosService = inject(EventosService);
  private readonly authService = inject(AuthService);
  public readonly sportColorService = inject(SportColorService);

  eventCode = signal<string>('');
  eventData = signal<any>(null);
  
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  
  actionLoading = signal<boolean>(false);
  actionDone = signal<boolean>(false);
  actionError = signal<boolean>(false);
  actionMessage = signal<string>('');
  
  isLoggedIn = signal<boolean>(false);

  private map: L.Map | undefined;
  private resizeObserver: ResizeObserver | undefined;

  ngOnInit() {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    
    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      if (code) {
        this.eventCode.set(code);
        this.loadEventData(code);
      } else {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private loadEventData(code: string) {
    this.loading.set(true);
    this.eventosService.getEventByCode(code).pipe(
      catchError(err => {
        this.notFound.set(true);
        this.loading.set(false);
        throw err;
      })
    ).subscribe(data => {
      this.eventData.set(data);
      this.loading.set(false);
      setTimeout(() => this.initMap(), 200);
    });
  }

  joinEvent() {
    if (!this.isLoggedIn()) {
      // Guardar en localStorage y redirigir a register
      localStorage.setItem('pendingEventInvite', this.eventCode());
      this.router.navigate(['/auth/register']);
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(false);
    
    this.eventosService.joinEventByCode(this.eventCode()).pipe(
      catchError(err => {
        this.actionLoading.set(false);
        this.actionError.set(true);
        this.actionMessage.set(err.error?.message || 'Error al unirse al evento.');
        throw err;
      })
    ).subscribe(() => {
      this.actionLoading.set(false);
      this.actionDone.set(true);
      this.actionMessage.set('¡Te has unido al evento con éxito!');
    });
  }

  goToLogin() {
    localStorage.setItem('pendingEventInvite', this.eventCode());
    this.router.navigate(['/auth/login']);
  }

  getUserLevel(participante: any, id_deporte: number): number {
    if (!participante?.usuario?.niveles_deportivos) return 1;
    const nivelObj = participante.usuario.niveles_deportivos.find((nd: any) => nd.id_deporte === id_deporte);
    return nivelObj ? nivelObj.nivel : 1;
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

  initMap() {
    const event = this.eventData();
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

  copiarCoordenadas(event: any) {
    const text = `${event.latitud}, ${event.longitud}`;
    navigator.clipboard.writeText(text).then(() => {
      // Optional: show a toast or change a signal
    });
  }
}
