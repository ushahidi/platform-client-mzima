import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  SessionService,
  AuthService,
  GtmTrackingService,
  EventBusService,
  EventType,
} from '@services';
import { LoginComponent } from '@auth';
import { MenuInterface, UserMenuInterface } from '@models';
import { CollectionsComponent } from '@data';
import { takeUntilDestroy$ } from '@helpers';
import { EnumGtmEvent, EnumGtmSource } from '@enums';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  public menu: MenuInterface[] = [];
  public userMenu: UserMenuInterface[] = [];
  userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
  public siteConfig = this.sessionService.getSiteConfigurations();
  public canRegister = false;

  constructor(
    private dialog: MatDialog,
    private sessionService: SessionService,
    private authService: AuthService,
    private gtmTracking: GtmTrackingService,
    private router: Router,
    private translate: TranslateService,
    private eventBusService: EventBusService,
  ) {}

  ngOnInit() {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.isAdmin = userData.role === 'admin';
      this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
      this.initMenu();
    });

    this.eventBusService.on(EventType.OpenLoginModal).subscribe({
      next: () => this.openLogin(),
    });
  }

  createRouterLink(route: string) {
    if (route !== 'map' && route !== 'feed') return route;
    return this.router.url.includes('collection')
      ? `${route}/collection/${this.router.url.split('/').pop() || ''}`
      : route;
  }

  private initMenu() {
    this.menu = [
      {
        label: 'views.map',
        router: 'map',
        icon: 'map',
        visible: true,
      },
      {
        label: 'views.data',
        router: 'feed',
        icon: 'data',
        visible: true,
      },
      {
        label: 'views.activity',
        router: 'activity',
        icon: 'activity',
        visible: true,
      },
      {
        label: 'nav.settings',
        router: 'settings',
        icon: 'settings',
        visible: this.isAdmin,
      },
    ];
    this.userMenu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: true,
        action: () => this.openCollections(),
      },
      {
        label: 'nav.login',
        icon: 'auth',
        visible: !this.isLoggedIn && !this.canRegister,
        action: () => this.openLogin(),
      },
      {
        label: 'Log in / Sign up',
        icon: 'auth',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.openLogin(),
      },
      {
        label: 'nav.logout',
        icon: 'logout',
        visible: this.isLoggedIn,
        action: () => this.logout(),
      },
    ];
  }

  private openLogin(): void {
    this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 576,
      data: {
        isSignupActive: this.canRegister,
      },
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: '768px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/']);
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
}
