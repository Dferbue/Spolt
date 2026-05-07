import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, HeaderAplicarion],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects as string)
    ),
    { initialValue: this.router.url }
  );

  vistaActiva = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/eventos/unirse'))      return 'unirse';
    if (url.includes('/eventos/crear'))       return 'crear';
    if (url.includes('/eventos/mis-eventos')) return 'mis-eventos';
    return 'inicio';
  });

  volverAlMenu() {
    this.router.navigate(['/eventos/inicio']);
  }
}
