import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  backgrounds = [
    '/welcome/hero-bg/soccer.png',
    '/welcome/hero-bg/basket.png',
    '/welcome/hero-bg/tennis.png'
  ];
  currentBgIndex = 0;
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    console.log('HomeComponent Initialized');
    this.startSlider();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setBg(index: number) {
    this.currentBgIndex = index;
    console.log('Manual background change to:', this.backgrounds[index]);
    this.cdr.detectChanges();

    // Reset interval when manual change occurs
    this.stopSlider();
    this.startSlider();
  }

  private startSlider() {
    this.intervalId = setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
      console.log('Auto background changed to:', this.backgrounds[this.currentBgIndex]);
      this.cdr.detectChanges(); // Force update
    }, 6000); // reduced to 6 seconds for slightly faster testing
  }

  private stopSlider() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
