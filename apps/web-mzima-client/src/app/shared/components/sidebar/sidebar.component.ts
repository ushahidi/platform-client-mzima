import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '@auth';
import { CollectionsComponent } from '@data';
import { EnumGtmEvent, EnumGtmSource, Roles, Permissions } from '@enums';
import { MenuInterface, SiteConfigInterface, UserMenuInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  BreakpointService,
  EventBusService,
  EventType,
  GtmTrackingService,
  SessionService,
} from '@services';
import { BaseComponent } from '../../../base.component';
import { SupportModalComponent } from '../support-modal/support-modal.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent extends BaseComponent implements OnInit {
  public isHost = false;
  public userMenu: UserMenuInterface[] = [];
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isInnerPage = false;
  public menu: MenuInterface[] = [];

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private gtmTracking: GtmTrackingService,
    private router: Router,
    private translate: TranslateService,
    private eventBusService: EventBusService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => {
        this.isInnerPage = Boolean(option.inner);
      },
    });

    this.eventBusService.on(EventType.OpenSupportModal).subscribe({
      next: () => this.openSupportModal(),
    });
  }

  ngOnInit() {
    this.getUserData();
    this.initNavigationMenu();

    this.eventBusService.on(EventType.OpenLoginModal).subscribe({
      next: (config) => this.openLogin(config),
    });
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
  }

  private initNavigationMenu(): void {
    this.menu = [
      {
        label: 'views.map',
        router: 'map',
        icon: 'map',
        ref: 'map',
      },
      {
        label: 'views.data',
        router: 'feed',
        icon: 'data',
        ref: 'feed',
      },
      {
        label: 'views.activity',
        router: 'activity',
        icon: 'activity',
        ref: 'activity',
      },
      {
        label: 'nav.settings',
        icon: 'settings',
        adminGuard: true,
        router: 'settings',
        ref: 'settings',
      },
    ];
  }

  createRouterLink(route: string) {
    if (route !== 'map' && route !== 'feed') return route;

    if (this.router.url.includes('collection')) {
      const tmpArr = this.router.url.split('/');
      const collectionId = tmpArr[tmpArr.findIndex((q) => q === 'collection') + 1];
      return `${route}/collection/${collectionId || ''}`;
    }

    if (this.router.url.includes('search')) {
      return `${route}/search/${this.router.url.split('/').pop() || ''}`;
    }

    return route;
  }

  private initMenu() {
    this.userMenu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: this.isDesktop && (!this.siteConfig.private || this.isLoggedIn),
        action: () => this.openCollections(),
        ref: 'collection',
      },
      {
        label: 'nav.login',
        icon: 'auth',
        visible: !this.isLoggedIn && !this.canRegister,
        action: () => this.openLogin(),
        ref: 'auth',
      },
      {
        label: 'nav.login_register',
        icon: 'auth',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.openLogin(),
        ref: 'auth',
      },
      {
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.openSupportModal(),
        ref: 'support',
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
      panelClass: 'modal',
    });

    dialogRef.afterClosed().subscribe({
      next: () => this.removeFocusFromMenuItem('collection'),
    });
  }

  registerPage(event: MouseEvent, router: string, label: string) {
    label = this.translate.instant(label);
    event.preventDefault();
    this.gtmTracking.registerEvent(
      {
        event: EnumGtmEvent.PageView,
        // @ts-ignore
        source: EnumGtmSource[label],
      },
      GtmTrackingService.MapPath(`/${router}`),
    );
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

  public getAccessToSite() {
    return this.sessionService.accessToSite;
  }
}
