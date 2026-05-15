import { Injectable } from '@angular/core';

type SwipeDirection = 'left' | 'right';

interface SwipeRoute {
  match: string;
  navigateTo: string;
}

@Injectable({
  providedIn: 'root',
})
export class MobileSwipeNavigationService {
  private readonly routes: SwipeRoute[] = [
    { match: '/inicio', navigateTo: '/inicio' },
    { match: '/eventos', navigateTo: '/eventos' },
    { match: '/amigos', navigateTo: '/amigos' },
    { match: '/perfil', navigateTo: '/perfil' },
  ];

  isSwipeableUrl(url: string): boolean {
    return this.getRouteIndex(url) !== -1;
  }

  getTargetRoute(url: string, direction: SwipeDirection): string | null {
    const currentIndex = this.getRouteIndex(url);
    if (currentIndex === -1) {
      return null;
    }

    const targetIndex = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= this.routes.length) {
      return null;
    }

    return this.routes[targetIndex].navigateTo;
  }

  private getRouteIndex(url: string): number {
    const normalizedUrl = this.normalizeUrl(url);
    return this.routes.findIndex(route => normalizedUrl.startsWith(route.match));
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
