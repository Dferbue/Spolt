import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeolocationService } from '../../../shared/services/geolocation.service';

interface DayForecast {
  date: string;
  dayName: string;
  dayNum: string;
  icon: string;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windSpeed: number;
}

@Component({
  selector: 'app-tiempo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tiempo.html',
  styleUrl: './tiempo.css',
})
export class Tiempo implements OnInit {
  private readonly geoService = inject(GeolocationService);

  forecast = signal<DayForecast[]>([]);
  locationName = signal('Cargando...');
  loading = signal(true);
  isLoadingLocation = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getUserLocation();
  }

  private async getUserLocation(): Promise<void> {
    this.isLoadingLocation.set(true);
    const { lat, lng } = await this.geoService.getUserLocation();
    this.isLoadingLocation.set(false);
    this.fetchWeatherFromBackend(lat, lng);
    this.locationName.set(await this.geoService.reverseGeocode(lat, lng));
  }

  // Obtenemos el tiempo a través de nuestro propio backend (conexión segura a AEMET)
  private async fetchWeatherFromBackend(lat: number, lon: number): Promise<void> {
    try {
      const url = `/api/v1/weather/forecast?lat=${lat}&lon=${lon}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al conectar con tu backend para el clima');
      }

      const backendData = await response.json();

      if (backendData && backendData.available === false) {
        this.error.set('Previsión meteorológica no disponible en este momento');
        this.forecast.set([]);
      } else {
        this.forecast.set(backendData.forecast || []);
        this.error.set(null);
      }
      this.loading.set(false);
    } catch (err) {
      console.error('Error al obtener el clima:', err);
      this.error.set('No se pudo conectar con el servidor para obtener el clima');
      this.loading.set(false);
    }
  }

  isToday(dateStr: string): boolean {
    const today = new Date();
    // Ajuste simple aislando la fecha del string para evitar zonas horarias problemáticas
    const targetDate = new Date(dateStr); 
    return targetDate.getDate() === today.getDate() &&
           targetDate.getMonth() === today.getMonth() &&
           targetDate.getFullYear() === today.getFullYear();
  }
}
