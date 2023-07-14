import { Component, OnInit } from '@angular/core';
import { NavToolbarService } from '../../../services/shared.navtoolbar.service';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { Observable } from 'rxjs';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';

@UntilDestroy() //Angular screams if this is not added even though it is already added in the NavToolbarService
@Component({
  selector: 'app-menu-list-non-page-links',
  templateUrl: './menu-list-non-page-links.component.html',
  styleUrls: ['./menu-list-non-page-links.component.scss'],
})
export class MenuListNonPageLinksComponent implements OnInit {
  public userData$: Observable<UserInterface>;
  public menu: UserMenuInterface[];
  public isLoggedIn: boolean;
  public siteConfig: SiteConfigInterface;
  public canRegister = false;

  constructor(private navToolbarService: NavToolbarService, private session: SessionService) {
    this.userData$ = this.navToolbarService.getUserData(this);
    this.siteConfig = this.session.getSiteConfigurations();
  }

  ngOnInit(): void {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
      this.initMenu();
    });
  }

  private initMenu() {
    console.log(this.isLoggedIn);
    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: true,
        action: () => this.navToolbarService.openCollections(),
      },
      {
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.navToolbarService.openSupportModal(),
      },
      {
        label: 'nav.my_account',
        icon: 'account',
        visible: this.isLoggedIn,
        action: () => this.navToolbarService.openAccountSettings(),
        separator: true,
      },
      {
        label: 'nav.logout',
        icon: 'logout',
        visible: this.isLoggedIn,
        action: () => this.navToolbarService.logout(),
      },
      {
        label: 'nav.login_register',
        icon: 'auth',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.navToolbarService.openLogin(this.canRegister),
      },
    ];
  }
}
