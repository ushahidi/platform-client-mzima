import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '@auth';
import { CollectionsComponent } from '../index';
import { EnumGtmEvent, EnumGtmSource, Roles, Permissions } from '@enums';
import { takeUntilDestroy$ } from '@helpers';
import { MenuInterface, SiteConfigInterface, UserMenuInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import {
  BreakpointService,
  EventBusService,
  EventType,
  GtmTrackingService,
  SessionService,
} from '@services';
import { Observable } from 'rxjs';
import { SupportModalComponent } from '../support-modal/support-modal.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  public isHost = false;
  public userMenu: UserMenuInterface[] = [];
  private userData$: Observable<UserInterface>;
  private isDesktop$: Observable<boolean>;
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isDesktop = false;
  public isInnerPage = false;
  public menu: MenuInterface[] = [];

  constructor(
    private dialog: MatDialog,
    private sessionService: SessionService,
    private gtmTracking: GtmTrackingService,
    private router: Router,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    this.siteConfig = this.sessionService.getSiteConfigurations();
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
        this.initNavigationMenu();
      },
    });

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
    });

    this.eventBusService.on(EventType.OpenLoginModal).subscribe({
      next: () => this.openLogin(),
    });
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
}
