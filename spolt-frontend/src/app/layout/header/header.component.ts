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
      background: var(--black);
      border-bottom: 6px solid var(--white);
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
    .logo-img { height: 45px; width: auto; image-rendering: pixelated; }
    .logo .text { font-size: 20px; color: var(--pink); letter-spacing: 3px; font-weight: bold; }
    
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
      background: #ff006e;
      border: 4px solid #000;
      padding: 8px 18px;
      cursor: pointer;
      box-shadow: 3px 3px 0px #880044, 5px 5px 0px #000;
      transition: all 0.1s;
      outline: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .retro-btn::before { content: '>'; font-size: 10px; opacity: 0; transition: opacity 0.2s; color: var(--white); }
    .btn-text { color: var(--white); font-size: 11px; letter-spacing: 1px; font-weight: bold; }

    .retro-btn:hover { background: #ff4d94; transform: translate(-1px, -1px); box-shadow: 3px 3px 0px #880044, 5px 5px 0px #000; }
    .retro-btn:hover::before { opacity: 1; }
    .retro-btn:active { transform: translate(2px, 2px); box-shadow: 0px 0px 0px #000; background: #880044; }

    .register-btn { background: var(--white); border-color: #000; box-shadow: 3px 3px 0px #ccc, 5px 5px 0px #000; }
    .register-btn .btn-text { color: var(--black); }
    .register-btn:hover { background: #f0f0f0; box-shadow: 4px 4px 0px #ccc, 6px 6px 0px #000; }
    .register-btn:hover .btn-text { color: #ff006e; }
    .register-btn::before { color: #ff006e; }

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
        border-bottom: 6px solid var(--white);
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
