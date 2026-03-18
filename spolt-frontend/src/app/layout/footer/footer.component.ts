import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <div class="pixel-frame">
        <p>2026 Spolt. MADE WITH <span class="pink">LOVE</span> IN SPAIN</p>
        <div class="konami-text">UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A</div>
      </div>
    </footer>
  `,
  styles: [`
    footer { padding: 40px; text-align: center; font-size: 10px; }
    .pink { color: var(--pink); }
    .konami-text { margin-top: 20px; color: #444; }
  `]
})
export class FooterComponent {
  private sequence: string[] = [];
  private konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.sequence.push(event.key);
    this.sequence = this.sequence.slice(-10);
    if (JSON.stringify(this.sequence) === JSON.stringify(this.konami)) {
      alert('¡SECRET LEVEL UNLOCKED!');
    }
  }
}
