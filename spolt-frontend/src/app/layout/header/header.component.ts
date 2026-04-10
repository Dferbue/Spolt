import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenuAndScroll(targetId: string) {
    this.isMenuOpen = false;
    this.scrollToSection(targetId);
  }

  scrollToSection(targetId: string) {
    const element = document.getElementById(targetId);
    
    if (!element) {
      // Si no estamos en la home, vamos a la home primero
      this.router.navigate(['/']).then(() => {
        // Delay para permitir que Angular renderice
        setTimeout(() => this.executeScroll(targetId), 100);
      });
      return;
    }

    this.executeScroll(targetId);
  }

  private executeScroll(targetId: string) {
    const element = document.getElementById(targetId);
    if (!element) return;

    const headerHeight = 100;
    const targetPosition = element.offsetTop - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1200; // Un poco más lento para lucir el efecto (1.2s)
    let start: number | null = null;

    const animation = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const step = this.easeOutExpo(progress, startPosition, distance, duration);
      window.scrollTo(0, step);
      if (progress < duration) {
        window.requestAnimationFrame(animation);
      } else {
        // Efecto de "golpe" o vibración al llegar (rebotito retro)
        window.scrollTo(0, targetPosition + 4);
        setTimeout(() => window.scrollTo(0, targetPosition), 50);
      }
    };

    window.requestAnimationFrame(animation);
  }

  // Función de suavizado "Ease Out Expo" para un frenado premium
  private easeOutExpo(t: number, b: number, c: number, d: number): number {
    return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  }
}
