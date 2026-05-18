import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InicioService } from '../service/inicio';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
})
export class Calendario implements OnInit {
  selectedDate = signal<string | null>(null);
  currentDate = signal(new Date());
  weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(public inicioService: InicioService) {}

  ngOnInit(): void {
    // Carga los eventos del usuario al iniciar el componente
    this.inicioService.fetchMyEvents();
  }

  // Label del mes actual (ej: "Abril 2026")
  monthLabel = computed(() => {
    const d = this.currentDate();
    return `${this.months[d.getMonth()]} ${d.getFullYear()}`;
  });

  // Días del mes (números y nulls para el offset)
  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const total = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = Array(offset).fill(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  });

  // Próximos 5 eventos (desde hoy en adelante)
  upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.formatDate(today);

    return this.inicioService.myEvents()
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  });

  // Eventos del día seleccionado
  selectedDateEvents = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return [];
    return this.inicioService.getMyEventsForDate(selected);
  });

  // Fecha hoy para resaltar
  isToday(day: number | null): boolean {
    if (day === null) return false;
    const today = new Date();
    const current = this.currentDate();
    return day === today.getDate() &&
           current.getMonth() === today.getMonth() &&
           current.getFullYear() === today.getFullYear();
  }

  // Genera la key YYYY-MM-DD para un día
  dateKey(day: number): string {
    const d = this.currentDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Formatea una fecha a YYYY-MM-DD
  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Obtiene eventos para un día específico (para el resumen en el calendario)
  getEventsForDay(day: number | null) {
    if (day === null) return [];
    const key = this.dateKey(day);
    return this.inicioService.getMyEventsForDate(key);
  }

  selectDay(day: number) {
    this.selectedDate.set(this.dateKey(day));
    
    // Auto-scroll en móviles para ver la info del día seleccionado
    setTimeout(() => {
      if (window.innerWidth <= 1150) {
        const panel = document.getElementById('panel-lateral');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  }

  changeMonth(dir: number) {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + dir, 1));
    this.selectedDate.set(null);
  }

  formatDateLabel(dateStr: string): string {
    const parts = dateStr.split('-');
    const day = parts[2];
    const month = this.months[parseInt(parts[1]) - 1].substring(0, 3).toLowerCase();
    return `${day} ${month}`;
  }
}
