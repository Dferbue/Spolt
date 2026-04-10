import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateEvent, TipoEvento } from '../models/createEvent';
import { EventosService } from '../service/eventos.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-event',
  imports: [FormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEventForm {
  private readonly eventosService = inject(EventosService);
  public TipoEvento = TipoEvento;

  mensajeEnvio = signal('');
  mostrarFormulario = signal(false);
  tipoSeleccionado = signal<TipoEvento | null>(null);
  listaDeportes = signal<any[]>([]);

  // Campos del formulario
  titulo = '';
  descripcion = '';
  id_deporte: number | null = null;
  fecha_evento = '';
  hora_inicio = '';
  hora_fin = '';
  numero_max_participantes: number | null = null;

  abrirFormulario(tipo: TipoEvento) {
    this.tipoSeleccionado.set(tipo);
    // Cargar deportes si aún no los tenemos
    if (this.listaDeportes().length === 0) {
      this.eventosService.getSports().subscribe((data: any[]) => this.listaDeportes.set(data || []));
    }
    this.limpiarFormulario();
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.tipoSeleccionado.set(null);
  }

  limpiarFormulario() {
    this.titulo = '';
    this.descripcion = '';
    this.id_deporte = null;
    this.fecha_evento = '';
    this.hora_inicio = '';
    this.hora_fin = '';
    this.numero_max_participantes = null;
  }

  submitFormulario() {
    if (!this.titulo || !this.id_deporte || !this.fecha_evento || !this.hora_inicio || !this.numero_max_participantes) {
      this.mensajeEnvio.set('⚠️ Rellena todos los campos obligatorios');
      setTimeout(() => this.mensajeEnvio.set(''), 3000);
      return;
    }

    const fechaHoraEvento = new Date(`${this.fecha_evento}T${this.hora_inicio}`);
    const ahora = new Date();

    if (fechaHoraEvento < ahora) {
      this.mensajeEnvio.set('⚠️ La fecha y hora no pueden ser en el pasado');
      setTimeout(() => this.mensajeEnvio.set(''), 3000);
      return;
    }

    const data: CreateEvent = {
      titulo: this.titulo,
      descripcion: this.descripcion || undefined,
      id_deporte: this.id_deporte,
      tipo_evento: this.tipoSeleccionado()!,
      fecha_evento: this.fecha_evento,
      hora_inicio: this.hora_inicio,
      hora_fin: this.hora_fin || undefined,
      numero_max_participantes: this.numero_max_participantes,
    };

    this.createEvent(data);
  }

  createEvent(data: CreateEvent) {
    this.eventosService.createEvent(data).subscribe({
      next: () => {
        this.mensajeEnvio.set('✅ Se ha creado correctamente el evento');
        this.cerrarFormulario();
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: () => {
        this.mensajeEnvio.set('❌ Error al crear el evento');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }
}
