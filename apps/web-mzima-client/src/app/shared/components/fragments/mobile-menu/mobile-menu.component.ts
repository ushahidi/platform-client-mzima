import { Component } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
})
export class MobileMenuComponent {
  public isDesktop$: Observable<boolean>;
  public isBurgerMenuOpen: boolean;
  public isDonateAvailable = false;

  public clickObservable: Observable<Event> = fromEvent(document, 'click');

  constructor(private navToolbarService: NavToolbarService) {
    this.isDesktop$ = this.navToolbarService.getScreenSize();
    this.subscribeToclickObservable();
  }

  private subscribeToclickObservable() {
    this.clickObservable.subscribe(() => {
      this.isBurgerMenuOpen = this.navToolbarService.isBurgerMenuOpen;
      this.isBurgerMenuOpen
        ? document.body.classList.add('burger-menu-open')
        : document.body.classList.remove('burger-menu-open');
      console.log(this.isBurgerMenuOpen);
    });
  }
}
