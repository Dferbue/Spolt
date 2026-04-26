import { Component, inject, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../service/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  totalUsuarios = 0;
  eventosActivos = 0;
  totalDeportes = 0;

  ngOnInit() {
    this.adminService.getTotalUsuarios().subscribe({
      next: (count: number) => {
        this.totalUsuarios = count;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error usuarios:', err)
    });

    this.adminService.getEventosActivos().subscribe({
      next: (count: number) => {
        this.eventosActivos = count;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error eventos:', err)
    });

    this.adminService.getTotalDeportes().subscribe({
      next: (count: number) => {
        this.totalDeportes = count;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error deportes:', err)
    });
  }

  navigateTo(path: string) {
    this.router.navigate(['/admin', path]);
  }
}
