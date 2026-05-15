import { Directive, ElementRef, HostBinding, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MobileSwipeNavigationService } from '../services/mobile-swipe-navigation.service';

@Directive({
  selector: '[appMobileSwipeNav]',
  standalone: true,
})
export class MobileSwipeNavDirective {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly swipeNavigation = inject(MobileSwipeNavigationService);

  private readonly mobileMediaQuery = window.matchMedia('(max-width: 600px)');
  private readonly maxPreviewOffset = 42;
  private readonly minHorizontalIntent = 14;
  private readonly swipeThreshold = 72;
  private readonly maxSwipeDurationMs = 700;

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private dragging = false;
  private horizontalGesture = false;
  private blocked = false;
  private currentTarget: EventTarget | null = null;

  @HostBinding('class.mobile-swipe-nav')
  protected readonly swipeClass = true;

  @HostBinding('style.touch-action')
  protected readonly touchAction = 'pan-y';

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.canStartGesture(event.target)) {
      this.resetGesture();
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    this.dragging = true;
    this.horizontalGesture = false;
    this.blocked = false;
    this.currentTarget = event.target;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.setTransition('');
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.dragging || this.blocked) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!this.horizontalGesture) {
      if (absX < this.minHorizontalIntent && absY < this.minHorizontalIntent) {
        return;
      }

      if (absY >= absX) {
        this.blocked = true;
        this.resetTransform();
        return;
      }

      if (absX < absY * 1.2) {
        return;
      }

      this.horizontalGesture = true;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const previewOffset = Math.max(
      -this.maxPreviewOffset,
      Math.min(this.maxPreviewOffset, deltaX * 0.22),
    );

    this.setTransform(previewOffset);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.dragging) {
      return;
    }

    const changedTouch = event.changedTouches[0];
    const endX = changedTouch?.clientX ?? this.startX;
    const endY = changedTouch?.clientY ?? this.startY;
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = Date.now() - this.startTime;

    this.finishGesture(deltaX, deltaY, duration);
  }

  @HostListener('touchcancel')
  onTouchCancel(): void {
    this.resetGesture();
    this.resetTransform();
  }

  private canStartGesture(target: EventTarget | null): boolean {
    if (!this.mobileMediaQuery.matches) {
      return false;
    }

    if (!this.swipeNavigation.isSwipeableUrl(this.router.url)) {
      return false;
    }

    if (this.hasOpenOverlay()) {
      return false;
    }

    const targetElement = target instanceof HTMLElement ? target : null;
    if (!targetElement) {
      return true;
    }

    return !this.isInteractiveTarget(targetElement);
  }

  private finishGesture(deltaX: number, deltaY: number, duration: number): void {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    const isValidSwipe =
      this.horizontalGesture &&
      absX >= this.swipeThreshold &&
      absX > absY * 1.2 &&
      duration <= this.maxSwipeDurationMs;

    if (!isValidSwipe) {
      this.resetGesture();
      this.resetTransform();
      return;
    }

    const direction = deltaX < 0 ? 'left' : 'right';
    const targetRoute = this.swipeNavigation.getTargetRoute(this.router.url, direction);

    if (!targetRoute) {
      this.resetGesture();
      this.resetTransform();
      return;
    }

    this.setTransition('transform 180ms ease');
    this.setTransform(deltaX < 0 ? -28 : 28);

    window.setTimeout(() => {
      this.router.navigateByUrl(targetRoute);
      this.resetTransform();
    }, 110);

    this.resetGesture();
  }

  private hasOpenOverlay(): boolean {
    return Boolean(
      document.querySelector(
        '.targetaAmistad-overlay, .modal-overlay, .ma-overlay, .logout-modal-backdrop, .ventana-overlay',
      ),
    );
  }

  private isInteractiveTarget(target: HTMLElement): boolean {
    return Boolean(
      target.closest(
        [
          'a',
          'button',
          'input',
          'textarea',
          'select',
          'label',
          '[role="button"]',
          '[contenteditable="true"]',
          '[data-swipe-ignore]',
        ].join(','),
      ),
    );
  }

  private resetGesture(): void {
    this.dragging = false;
    this.horizontalGesture = false;
    this.blocked = false;
    this.currentTarget = null;
  }

  private resetTransform(): void {
    this.setTransition('transform 180ms ease');
    this.setTransform(0);
  }

  private setTransform(offsetX: number): void {
    this.elementRef.nativeElement.style.transform = `translate3d(${offsetX}px, 0, 0)`;
  }

  private setTransition(value: string): void {
    this.elementRef.nativeElement.style.transition = value;
  }
}
