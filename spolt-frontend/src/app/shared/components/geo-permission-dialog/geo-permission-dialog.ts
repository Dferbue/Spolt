import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-geo-permission-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="geo-overlay">
      <div class="geo-modal">
        <div class="geo-icon">📍</div>
        <h2>¿NOS DEJAS VER TU UBICACIÓN?</h2>
        <p>Necesitamos saber dónde estás para mostrarte los eventos y partidos más cercanos a ti.</p>
        
        <div class="geo-actions">
          <button class="geo-btn geo-btn-secondary" (click)="onDecline.emit()">AHORA NO</button>
          <button class="geo-btn geo-btn-primary" (click)="onAccept.emit()">DAR ACCESO</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .geo-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      backdrop-filter: blur(4px);
    }

    .geo-modal {
      background: white;
      border: 4px solid #000;
      border-radius: 24px;
      padding: 40px 30px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 12px 12px 0px #ff006e;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .geo-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 24px;
      font-weight: 950;
      color: #000;
      margin-bottom: 15px;
      letter-spacing: -1px;
      line-height: 1.1;
    }

    p {
      font-size: 16px;
      font-weight: 700;
      color: #444;
      margin-bottom: 30px;
      line-height: 1.4;
    }

    .geo-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .geo-btn {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      font-weight: 950;
      text-transform: uppercase;
      border: 3px solid #000;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .geo-btn-primary {
      background: #ff006e;
      color: white;
      box-shadow: 4px 4px 0px #000;
    }

    .geo-btn-primary:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px #000;
    }

    .geo-btn-secondary {
      background: white;
      color: #000;
      border-color: #ddd;
    }

    .geo-btn-secondary:hover {
      border-color: #000;
    }
  `]
})
export class GeoPermissionDialog {
  @Output() onAccept = new EventEmitter<void>();
  @Output() onDecline = new EventEmitter<void>();
}
