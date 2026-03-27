import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
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
    this.profile$ = null;
    this.clearTokens();
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {});
  }

  private profile$: Observable<any> | null = null;

  getProfile(): Observable<any> {
    if (!this.profile$) {
      this.profile$ = this.http.get(`${this.apiUrl}/profile`).pipe(
        shareReplay(1)
      );
    }
    return this.profile$;
  }

  // Método para forzar la recarga (útil después de editar el perfil)
  refreshProfile(): void {
    this.profile$ = null;
  }

  refreshTokens(): Observable<{ accessToken: string, refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  // Token Management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
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
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}
