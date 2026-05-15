import { Injectable, signal } from '@angular/core';

export interface UserLocation {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly DEFAULT_LAT = 40.41;
  private readonly DEFAULT_LNG = -3.70;
  private readonly DEFAULT_NAME = 'Madrid';
  private currentLocation = signal<UserLocation | null>(null);
  private inFlightLocationRequest?: Promise<UserLocation | null>;

  showPermissionDialog = signal(false);
  private permissionResolve?: (v: boolean) => void;

  async getUserLocation(forceRefresh = false): Promise<UserLocation | null> {
    if (!forceRefresh && this.currentLocation()) {
      return this.currentLocation();
    }

    if (this.inFlightLocationRequest) {
      return this.inFlightLocationRequest;
    }

    const hasPermission = await this.requestPermission();
    if (!navigator.geolocation || !hasPermission) {
      return null;
    }

    this.inFlightLocationRequest = new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.currentLocation.set(location);
          this.inFlightLocationRequest = undefined;
          resolve(location);
        },
        () => {
          const cachedLocation = this.currentLocation();
          this.inFlightLocationRequest = undefined;
          resolve(cachedLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });

    return this.inFlightLocationRequest;
  }

  getCachedLocation(): UserLocation | null {
    return this.currentLocation();
  }

  clearCachedLocation(): void {
    this.currentLocation.set(null);
  }

  private async requestPermission(): Promise<boolean> {
    if (sessionStorage.getItem('spolt_location_declined') === 'true') {
      return false;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted') {
          return true;
        }
        if (status.state === 'denied') {
          return false;
        }
      } catch {
        // Navegador sin soporte de Permissions API o implementación parcial.
      }
    }

    return new Promise((resolve) => {
      this.permissionResolve = resolve;
      this.showPermissionDialog.set(true);
    });
  }

  handlePermissionChoice(accept: boolean) {
    this.showPermissionDialog.set(false);
    if (!accept) {
      sessionStorage.setItem('spolt_location_declined', 'true');
      this.clearCachedLocation();
    }
    if (this.permissionResolve) {
      this.permissionResolve(accept);
      this.permissionResolve = undefined;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data || !data.address) {
        return data?.name || 'Tu ubicación';
      }

      const addr = data.address;
      return addr.city ||
             addr.town ||
             addr.village ||
             addr.municipality ||
             addr.suburb ||
             addr.city_district ||
             addr.county ||
             addr.state ||
             data.name ||
             'Tu ubicación';
    } catch {
      return 'Tu ubicación';
    }
  }

  async geocode(address: string): Promise<UserLocation | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=es&accept-language=es`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  }

  async searchSuggestions(address: string): Promise<any[]> {
    if (!address.trim()) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&addressdetails=1&countrycodes=es&accept-language=es`;
      const response = await fetch(url);
      return await response.json();
    } catch {
      return [];
    }
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getDefaultLocation(): UserLocation {
    return { lat: this.DEFAULT_LAT, lng: this.DEFAULT_LNG };
  }

  getDefaultName(): string {
    return this.DEFAULT_NAME;
  }
}
