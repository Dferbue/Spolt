import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad.html',
  styles: [`
    .legal-container {
      max-width: 800px;
      margin: 120px auto 40px;
      padding: 32px;
      background: white;
      border: 4px solid #111;
      border-radius: 12px;
      box-shadow: 8px 8px 0px var(--pink);
      color: #111;
    }
    h1 {
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
      margin-bottom: 24px;
      font-size: 2.5rem;
      border-bottom: 4px solid #111;
      padding-bottom: 12px;
    }
    h2 {
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 32px;
      margin-bottom: 16px;
      font-size: 1.5rem;
    }
    p, ul {
      margin-bottom: 16px;
      line-height: 1.6;
      font-size: 1.1rem;
    }
    li {
      margin-bottom: 8px;
    }
    .back-btn {
      display: inline-block;
      margin-bottom: 24px;
      padding: 12px 20px;
      font-weight: 900;
      text-transform: uppercase;
      border: 2px solid #111;
      border-radius: 8px;
      background: #111;
      color: white;
      box-shadow: 4px 4px 0px var(--pink);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
    }
    .back-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px var(--pink);
    }
    .back-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px var(--pink);
    }
  `]
})
export class Privacidad {
  constructor(private location: Location, private router: Router) {}

  goBack() {
    if (window.history.length > 2) {
      this.location.back();
    } else {
      window.close();
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 100);
    }
  }
}
