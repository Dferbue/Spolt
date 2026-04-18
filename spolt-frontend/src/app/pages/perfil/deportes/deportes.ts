import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelDeportivo } from '../model/nivelDeportivo';
import { PerfilService } from '../service/perfil.service';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deportes.html',
  styleUrl: './deportes.css',
})
export class Deportes implements OnInit {
  niveles: NivelDeportivo[] = [];
  isLoading = true;

  private perfilService = inject(PerfilService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.perfilService.getMisNiveles().subscribe({
      next: (data) => {
        this.niveles = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching sport levels:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getProgreso(xpActual: number, xpSiguienteNivel: number): number {
    if (!xpSiguienteNivel) return 0;
    return Math.min(100, Math.round((xpActual / xpSiguienteNivel) * 100));
  }
}

