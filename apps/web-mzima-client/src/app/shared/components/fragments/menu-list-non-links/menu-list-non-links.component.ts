import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { EventBusService, EventType, SessionService } from '@services';
import { Permissions, Roles } from '@enums';
import { LoginComponent } from '@auth';
import { SupportModalComponent } from '../../support-modal/support-modal.component';
import { CollectionsComponent } from '../../collections/collections.component';

@UntilDestroy() //Angular screams if this is not added even though it is already added in the NavToolbarService
@Component({
  selector: 'app-menu-list-non-links',
  templateUrl: './menu-list-non-links.component.html',
  styleUrls: ['./menu-list-non-links.component.scss'],
})
export class MenuListNonLinksComponent implements OnInit {
  public userData$: Observable<UserInterface>;
  public menu: UserMenuInterface[];
  public isDesktop: boolean;
  public isLoggedIn: boolean;
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isHost = false;

  constructor(
    private dialog: MatDialog,
    private navToolbarService: NavToolbarService,
    private session: SessionService,
    private eventBusService: EventBusService,
  ) {
    this.navToolbarService.getScreenSize().subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
    this.userData$ = this.navToolbarService.getUserData(this);
    this.siteConfig = this.session.getSiteConfigurations();
    this.eventBusService.on(EventType.OpenSupportModal).subscribe({
      next: () => this.openSupportModal(),
    });
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
    this.eventBusService.on(EventType.OpenLoginModal).subscribe({
      next: () => this.openLogin(),
    });
  }

  private initMenu() {
    const hideMobileMenuOnSmallerDevices = () =>
      !this.isDesktop ? this.navToolbarService.toggleBurgerMenu(false) : null;

    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: true,
        action: () => {
          this.openCollections();
          hideMobileMenuOnSmallerDevices();
        },
        ref: 'collection',
        forDesktop: true, //adding/using forDesktop since menuItem.visible does not work on resize from mobile to desktop
      },
      {
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.openSupportModal(),
        ref: 'support',
        forDesktop: true,
      },
      {
        label: 'nav.my_account',
        icon: 'account',
        visible: this.isLoggedIn && (!this.isDesktop ?? false),
        action: () => {
          this.navToolbarService.openAccountSettings();
          hideMobileMenuOnSmallerDevices();
        },
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
        action: () => {
          this.openLogin();
          hideMobileMenuOnSmallerDevices();
        },
        ref: 'auth',
        forDesktop: !this.isLoggedIn && this.canRegister,
      },
    ];
  }

  private openLogin(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'login-modal'],
      data: {
        isSignupActive: this.canRegister,
      },
    });
    dialogRef.afterClosed().subscribe({
      next: () => this.removeFocusFromMenuItem('auth'),
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: ['modal', 'collections-modal'],
    });
    dialogRef.afterClosed().subscribe({
      next: () => this.removeFocusFromMenuItem('collection'),
    });
  }

  public openSupportModal(): void {
    const dialogRef = this.dialog.open(SupportModalComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: ['modal', 'support-modal'],
    });
    dialogRef.afterClosed().subscribe({
      next: () => this.removeFocusFromMenuItem('support'),
    });
  }

  private removeFocusFromMenuItem(ref: string) {
    document.getElementById(ref)?.blur();
  }
}
