import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="pixel-header">
      <div class="logo-container">
        <div class="logo" (click)="scrollToSection('inicio')" style="cursor: pointer;">
          <img src="logo/Logo.png" alt="Spolt Logo" class="logo-img">
          <span class="text">SPOLT</span>
        </div>
        
        <button class="menu-toggle" (click)="toggleMenu()" [class.open]="isMenuOpen">
          <div class="hamburger"></div>
        </button>
      </div>

      <nav [class.open]="isMenuOpen">
        <div class="nav-links">
          <a (click)="closeMenuAndScroll('inicio')">INICIO</a>
          <a (click)="closeMenuAndScroll('habilidades')">HABILIDADES</a>
          <a (click)="closeMenuAndScroll('funcionamiento')">FUNCIONAMIENTO</a>
          <a (click)="closeMenuAndScroll('deportes')">DEPORTES</a>
          <a (click)="closeMenuAndScroll('conocenos')">CONOCENOS</a>
        </div>
        
        <div class="header-actions mobile-actions">
          <button class="retro-btn" routerLink="/login" (click)="isMenuOpen = false">
            <span class="btn-text">INICIO SESIÓN</span>
          </button>
          <button class="retro-btn register-btn" routerLink="/register" (click)="isMenuOpen = false">
            <span class="btn-text">REGISTRO</span>
          </button>
        </div>
      </nav>

      <div class="header-actions desktop-actions">
        <button class="retro-btn" routerLink="/login">
          <span class="btn-text">INICIO SESIÓN</span>
        </button>
        <button class="retro-btn register-btn" routerLink="/register">
          <span class="btn-text">REGISTRO</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .pixel-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 15px 30px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 90px;
      background: rgba(10, 10, 10, 0.95);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      z-index: 1000;
      box-sizing: border-box;
    }

    .logo-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: auto;
    }

    .logo { display: flex; align-items: center; gap: 15px; }
    .logo-img { height: 45px; width: auto; }
    .logo .text { font-size: 20px; color: var(--pink); letter-spacing: 3px; font-weight: 800; }
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      padding: 10px;
      cursor: pointer;
      z-index: 1001;
    }

    .hamburger {
      width: 25px;
      height: 3px;
      background: var(--white);
      position: relative;
      transition: all 0.3s ease;
    }

    .hamburger::before, .hamburger::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 3px;
      background: var(--white);
      transition: all 0.3s ease;
    }

    .hamburger::before { top: -8px; }
    .hamburger::after { bottom: -8px; }

    .menu-toggle.open .hamburger { background: transparent; }
    .menu-toggle.open .hamburger::before { transform: rotate(45deg); top: 0; }
    .menu-toggle.open .hamburger::after { transform: rotate(-45deg); bottom: 0; }

    nav { 
      margin: 0; 
      padding: 0; 
      display: flex; 
      gap: 35px; 
      align-items: center;
    }

    .nav-links {
      display: flex;
      gap: 30px;
    }

    nav a { text-decoration: none; color: var(--white); font-size: 11px; transition: color 0.2s; cursor: pointer; }
    nav a:hover { color: var(--pink); }
    
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .mobile-actions { display: none; }
    
    .retro-btn {
      position: relative;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: var(--border-radius);
      padding: 12px 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-text { color: var(--white); font-size: 13px; letter-spacing: 1px; font-weight: 600; transition: color 0.3s ease; }

    .retro-btn:hover { background: rgba(255,255,255,0.05); border-color: var(--pink); }
    .retro-btn:hover .btn-text { color: var(--pink); }
    .retro-btn:active { transform: scale(0.98); }

    .register-btn { background: var(--white); border-color: var(--white); }
    .register-btn .btn-text { color: var(--black); }
    .register-btn:hover { background: transparent; }
    .register-btn:hover .btn-text { color: var(--pink); }

    @media (max-width: 1024px) {
      .pixel-header { padding: 10px 15px; }
      .nav-links { gap: 10px; }
      nav a { font-size: 7px; }
      .btn-text { font-size: 7px; }
    }

    @media (max-width: 850px) {
      .logo-container { width: 100%; }
      .menu-toggle { display: block; }
      .desktop-actions { display: none; }
      
      nav {
        position: fixed;
        top: 90px;
        left: 0;
        width: 100%;
        height: 0;
        background: var(--black);
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 50px;
        gap: 30px;
        overflow: hidden;
        transition: height 0.3s ease;
        border-bottom: 0px solid var(--white);
      }

      nav.open {
        height: calc(100vh - 90px);
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .nav-links {
        flex-direction: column;
        width: 100%;
        align-items: center;
        gap: 25px;
      }

      nav a { font-size: 14px; }
      
      .mobile-actions {
        display: flex;
        flex-direction: column;
        width: 80%;
        gap: 15px;
      }

      .mobile-actions .retro-btn {
        width: 100%;
        padding: 15px;
        justify-content: center;
      }

      .mobile-actions .btn-text {
        font-size: 12px;
      }
    }
  `]
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
