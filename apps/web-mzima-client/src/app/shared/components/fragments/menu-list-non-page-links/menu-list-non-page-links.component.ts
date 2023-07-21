import { Component, OnInit } from '@angular/core';
import { NavToolbarService } from '../../../services/shared.navtoolbar.service';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { Observable } from 'rxjs';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { Permissions, Roles } from '@enums';

@UntilDestroy() //Angular screams if this is not added even though it is already added in the NavToolbarService
@Component({
  selector: 'app-menu-list-non-page-links',
  templateUrl: './menu-list-non-page-links.component.html',
  styleUrls: ['./menu-list-non-page-links.component.scss'],
})
export class MenuListNonPageLinksComponent implements OnInit {
  public userData$: Observable<UserInterface>;
  public menu: UserMenuInterface[];
  public isDesktop: boolean;
  public isLoggedIn: boolean;
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isHost = false;

  constructor(private navToolbarService: NavToolbarService, private session: SessionService) {
    this.navToolbarService.getScreenSize().subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
        // console.log(this.isDesktop);
      },
    });
    this.userData$ = this.navToolbarService.getUserData(this);
    this.siteConfig = this.session.getSiteConfigurations();
  }

  ngOnInit(): void {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      const hostRoles = [
        Permissions.ManageUsers,
        Permissions.ManageSettings,
        Permissions.ImportExport,
      ];
      this.isHost =
        userData.role === Roles.Admin || hostRoles.some((r) => userData.permissions?.includes(r));
      this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
      this.initMenu();
    });
  }

  private initMenu() {
    // console.log(this.isLoggedIn);

    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: true,
        action: () => this.navToolbarService.openCollections(),
        ref: 'collection',
      },
      {
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.navToolbarService.openSupportModal(),
        ref: 'support',
      },
      {
        label: 'nav.my_account',
        icon: 'account',
        visible: this.isLoggedIn && !this.isDesktop,
        action: () => this.navToolbarService.openAccountSettings(),
        separator: true,
      },
      {
        label: 'nav.logout',
        icon: 'logout',
        visible: this.isLoggedIn && !this.isDesktop,
        action: () => this.navToolbarService.logout(),
      },
      {
        label: 'nav.login_register',
        icon: 'auth',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.navToolbarService.openLogin(this.canRegister),
        ref: 'auth',
      },
    ];
  }
}
