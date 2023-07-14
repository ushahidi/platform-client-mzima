import { Component } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'; //- remove this?
import { NavToolbarService } from '../../../services/shared.navtoolbar.service';

//@UntilDestroy() //- remove this?
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
    this.isDesktop$ = this.navToolbarService.getScreenSize(); //.pipe(untilDestroyed(this)); //- remove this?
    this.subscribeToclickObservable();
  }

  // ngOnInit(): void {
  //   // this.userData$.subscribe((userData) => {
  //   //   this.profile = userData;
  //   //   this.isLoggedIn = !!userData.userId;
  //   //   this.isAdmin = userData.role === 'admin';
  //   //   this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
  //   //   // this.initMenu();
  //   // });
  //   this.menu = this.navToolbarService.initMenu();
  //   console.log(this.menu);
  // }

  private subscribeToclickObservable() {
    this.clickObservable.subscribe(() => {
      this.isBurgerMenuOpen = this.navToolbarService.isBurgerMenuOpen;
      this.isBurgerMenuOpen
        ? document.body.classList.add('burger-menu-open')
        : document.body.classList.remove('burger-menu-open');
      console.log(this.isBurgerMenuOpen);
    });
  }

  public openAccountSettings() {
    this.navToolbarService.openAccountSettings();
  }

  public logout() {
    this.navToolbarService.logout();
  }
}
