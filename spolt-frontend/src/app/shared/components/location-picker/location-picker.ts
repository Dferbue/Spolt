import { Component, ElementRef, EventEmitter, inject, Input, OnInit, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as L from 'leaflet';
import { GeolocationService } from '../../services/geolocation.service';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-picker.html',
  styleUrl: './location-picker.css',
})
export class LocationPicker implements OnInit, OnDestroy {
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Output() locationChange = new EventEmitter<LocationData>();

  private readonly geoService = inject(GeolocationService);

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker!: L.Marker;
  address = '';
  loading = true;
  private resizeObserver?: ResizeObserver;
  
  searchQuery = '';
  isSearching = false;
  suggestions: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private readonly DEFAULT_ZOOM = 14;
  private readonly MARKER_ICON = L.icon({
    iconUrl: 'assets/leaflet/marker-icon.png',
    iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  async ngOnInit(): Promise<void> {
    let lat = this.initialLat;
    let lng = this.initialLng;

    if (lat == null || lng == null) {
      const location = await this.geoService.getUserLocation();
      lat = location.lat;
      lng = location.lng;
    }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.fetchSuggestions(query);
    });

    this.loading = false;
    
    this.initMap(lat, lng);
    this.updateAddress(lat, lng);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private initMap(lat: number, lng: number): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: this.DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], {
      draggable: true,
      icon: this.MARKER_ICON,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.emitLocation(pos.lat, pos.lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.emitLocation(lat, lng);
    });

    this.resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private emitLocation(lat: number, lng: number): void {
    this.updateAddress(lat, lng);
    this.locationChange.emit({ lat, lng, address: this.address });
  }

  private async updateAddress(lat: number, lng: number): Promise<void> {
    this.address = await this.geoService.reverseGeocode(lat, lng);
    this.locationChange.emit({ lat, lng, address: this.address });
  }

  async searchLocation(): Promise<void> {
    if (!this.searchQuery.trim() || this.isSearching) return;
    
    this.isSearching = true;
    this.showSuggestions = false;
    const coords = await this.geoService.geocode(this.searchQuery);
    
    if (coords) {
      this.map.setView([coords.lat, coords.lng], this.DEFAULT_ZOOM);
      this.marker.setLatLng([coords.lat, coords.lng]);
      this.emitLocation(coords.lat, coords.lng);
      this.searchQuery = ''; // Clear search after success
    } else {
      alert('No se ha encontrado ninguna ubicación con ese nombre.');
    }
    this.isSearching = false;
  }

  onSearchInput(query: string) {
    this.searchQuery = query;
    if (query.length > 2) {
      this.searchSubject.next(query);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  async fetchSuggestions(query: string) {
    this.suggestions = await this.geoService.searchSuggestions(query);
    this.showSuggestions = this.suggestions.length > 0;
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.display_name;
    this.showSuggestions = false;
    this.suggestions = [];
    
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    this.map.setView([lat, lng], this.DEFAULT_ZOOM);
    this.marker.setLatLng([lat, lng]);
    this.emitLocation(lat, lng);
  }
}
