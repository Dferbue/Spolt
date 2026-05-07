import { Injectable } from '@angular/core';

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

  getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: this.DEFAULT_LAT, lng: this.DEFAULT_LNG });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve({ lat: this.DEFAULT_LAT, lng: this.DEFAULT_LNG });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 3600000,
        }
      );
    });
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
    const R = 6371; // Radio de la Tierra en km
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
