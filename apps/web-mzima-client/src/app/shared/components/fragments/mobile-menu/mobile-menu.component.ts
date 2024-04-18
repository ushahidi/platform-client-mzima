import { Component, EventEmitter, Output } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { BaseComponent } from '../../../../base.component';
import { BreakpointService, SessionService } from '@services';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
})
export class MobileMenuComponent extends BaseComponent {
  @Output() isBurgerMenuOpenEvent = new EventEmitter<boolean>();
  public isBurgerMenuOpen: boolean;
  public clickObservable: Observable<Event> = fromEvent(document, 'click');

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private navToolbarService: NavToolbarService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.subscribeToclickObservable();
  }

  loadData(): void {}

  private subscribeToclickObservable() {
    this.clickObservable.subscribe(() => {
      this.isBurgerMenuOpen = this.navToolbarService.isBurgerMenuOpen;
      this.isBurgerMenuOpen
        ? document.body.classList.add('burger-menu-open')
        : document.body.classList.remove('burger-menu-open');
      // Get isBurgerMenuOpen for use in parent component to hide (the whole of) mobile-menu
      this.getIsBurgerMenuOpen(this.isBurgerMenuOpen);
    });
  }

  public getIsBurgerMenuOpen(value: boolean) {
    this.isBurgerMenuOpenEvent.emit(value);
  }
}
