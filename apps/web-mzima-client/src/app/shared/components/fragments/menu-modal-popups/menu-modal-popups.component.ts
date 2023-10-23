import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import {
  AuthService,
  BreakpointService,
  EventBusService,
  EventType,
  SessionService,
} from '@services';
import { Permissions, Roles } from '@enums';
import { LoginComponent } from '@auth';
import { SupportModalComponent } from '../../support-modal/support-modal.component';
import { CollectionsComponent } from '../../collections/collections.component';
import { BaseComponent } from '../../../../base.component';

@Component({
  selector: 'app-menu-modal-popups',
  templateUrl: './menu-modal-popups.component.html',
  styleUrls: ['./menu-modal-popups.component.scss'],
})
export class MenuModalPopupsComponent extends BaseComponent implements OnInit {
  public menu: UserMenuInterface[];
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isHost = false;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private navToolbarService: NavToolbarService,
    private eventBusService: EventBusService,
    private authService: AuthService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.eventBusService.on(EventType.OpenSupportModal).subscribe({
      next: () => this.openSupportModal(),
    });
  }

  ngOnInit(): void {
    this.getUserData();
  }

  loadData(): void {
    this.siteConfig = this.sessionService.getSiteConfigurations();
    const hostRoles = [
      Permissions.ManageUsers,
      Permissions.ManageSettings,
      Permissions.ImportExport,
    ];
    this.isHost =
      this.user.role === Roles.Admin || hostRoles.some((r) => this.user.permissions?.includes(r));
    this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
    this.initMenu();
    this.eventBusService.on(EventType.OpenLoginModal).subscribe({
      next: (config) => this.openLogin(config),
    });
  }

  private initMenu() {
    const hideMobileMenuOnSmallerDevices = () =>
      !this.isDesktop ? this.navToolbarService.toggleBurgerMenu(false) : null;

    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: !this.siteConfig.private || this.isLoggedIn,
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
        action: () => this.authService.logout(),
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

  private openLogin(config?: any): void {
    const dialogConfig = {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'login-modal'],
      data: {
        isSignupActive: this.canRegister,
        isDisableClose: config?.disableClose || false,
      },
    };
    const dialogRef = this.dialog.open(LoginComponent, {
      ...dialogConfig,
      ...config,
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
