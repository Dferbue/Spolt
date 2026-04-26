import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginDto {
  email: string; // El backend espera explícitamente 'email'
  password: string;
}

export interface RegisterDto {
  nombre_usuario: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  login(credentials: LoginDto): Observable<{ message?: string, accessToken: string, refreshToken: string }> {
    return this.http.post<{ message?: string, accessToken: string, refreshToken: string }>(`${this.apiUrl}/login`, credentials);
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<{ message: string }> {
    this.profileSubject.next(null);
    this.clearTokens();
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {});
  }

  private profileSubject = new BehaviorSubject<any>(null);
  public profile$ = this.profileSubject.asObservable();
  private loadingProfile = false;

  getProfile(): Observable<any> {
    if (!this.profileSubject.value && !this.loadingProfile) {
      this.refreshProfile();
    }
    return this.profile$;
  }

  refreshProfile(): void {
    if (this.loadingProfile) return;
    this.loadingProfile = true;

    this.http.get(`${this.apiUrl}/profile`).subscribe({
      next: (user) => {
        this.profileSubject.next(user);
        this.loadingProfile = false;
      },
      error: () => {
        this.loadingProfile = false;
      }
    });
  }

  updateProfileState(userData: any): void {
    this.profileSubject.next(userData);
  }

  refreshTokens(): Observable<{ accessToken: string, refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  // Token Management
  private readonly INACTIVITY_LIMIT_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.updateLastActivity();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('last_activity');
  }

  // Actualiza el timestamp de última actividad
  updateLastActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  // Comprueba si han pasado más de 14 días sin actividad
  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return false; // Primera vez, no expira
    return (Date.now() - parseInt(lastActivity, 10)) > this.INACTIVITY_LIMIT_MS;
  }

  isLoggedIn(): boolean {
    if (!this.getAccessToken()) return false;

    // Si han pasado >14 días de inactividad, cerramos sesión automáticamente
    if (this.isSessionExpired()) {
      this.profileSubject.next(null);
      this.clearTokens();
      return false;
    }

    return true;
  }

  // --- Recuperación y cambio de cuenta ---

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  requestEmailChange(newEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-email-change`, { newEmail });
  }

  confirmEmailChange(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-email-change`, { token });
  }

  confirmRegistration(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-register`, { token });
  }

  pingOnline(): Observable<any> {
    return this.http.patch(`/api/v1/users/ping`, {});
  }
}
