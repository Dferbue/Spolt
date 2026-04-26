import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Target, TargetAction } from '../target/target';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, Target],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  // Inputs
  public items = input<any[]>([]);
  public tipo = input<'evento' | 'usuario' | 'deporte'>('evento');
  public loading = input<boolean>(false);
  public trackField = input<string>('id');
  public textoVacio = input<string>('No se han encontrado resultados');

  // Paginación
  public paginaActual = input<number>(1);
  public totalPaginas = input<number>(1);
  public totalItems = input<number>(0);
  public mostrarPaginacion = input<boolean>(true);

  // Outputs
  public onItemAction = output<TargetAction>();
  public onCambiarPagina = output<number>();

  handleAction(event: TargetAction) {
    this.onItemAction.emit(event);
  }

  cambiarPagina(pagina: number) {
    this.onCambiarPagina.emit(pagina);
  }
}
