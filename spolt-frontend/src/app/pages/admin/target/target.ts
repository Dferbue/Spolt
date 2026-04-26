import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportColorService } from '../../../shared/services/sport-color.service';


export interface TargetAction {
  item: any;
  action: string;
}

@Component({
  selector: 'app-target',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target.html',
  styleUrl: './target.css',
})
export class Target {
  // Inputs
  public item = input<any>();
  public tipo = input<'evento' | 'usuario' | 'deporte'>('evento');

  // Output
  public onAction = output<TargetAction>();

  private sportColorService = inject(SportColorService);

  get sportColor(): string {
    if (this.tipo() === 'evento') {
      return this.sportColorService.getColor(this.item()?.deporte);
    } else if (this.tipo() === 'deporte') {
      return this.sportColorService.getColor(this.item());
    }
    return 'transparent';
  }

  get sportDarkColor(): string {
    if (this.tipo() === 'evento') {
      return this.sportColorService.getDarkColor(this.item()?.deporte, 30);
    } else if (this.tipo() === 'deporte') {
      return this.sportColorService.getDarkColor(this.item(), 30);
    }
    return '#ff006e';
  }

  emitAction(action: string) {
    this.onAction.emit({ item: this.item(), action });
  }
}
