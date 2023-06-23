import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { navigationMenu } from '@constants';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  public menu = navigationMenu;

  constructor(private router: Router) {}

  isButtonActive(route: any): boolean {
    const currentRoute = this.router.url;

    if (route.activeRoutes) {
      for (const activeRoute of route.activeRoutes) {
        if (currentRoute.startsWith(activeRoute)) {
          return route.route === '/' || activeRoute === '/';
        }
      }
    }

    return currentRoute === route.route;
  }
}
