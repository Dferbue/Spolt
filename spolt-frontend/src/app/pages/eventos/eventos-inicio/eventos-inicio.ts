import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eventos-inicio',
  standalone: true,
  imports: [],
  templateUrl: './eventos-inicio.html',
  styleUrl: './eventos-inicio.css',
})
export class EventosInicio {
  private router = inject(Router);

  ir(ruta: string) {
    this.router.navigate(['/eventos', ruta]);
  }
}
