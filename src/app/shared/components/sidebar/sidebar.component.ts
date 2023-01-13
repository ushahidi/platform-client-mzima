import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  SessionService,
  AuthService,
  GtmTrackingService,
  EventBusService,
  EventType,
  BreakpointService,
} from '@services';
import { LoginComponent } from '@auth';
import { UserMenuInterface } from '@models';
import { CollectionsComponent } from '@data';
import { takeUntilDestroy$, menuHelper } from '@helpers';
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
  public menu = menuHelper.menu;
  public userMenu: UserMenuInterface[] = [];
  userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
  public siteConfig = this.sessionService.getSiteConfigurations();
  public canRegister = false;
  public isDesktop = false;
  public isInnerPage = false;

  constructor(
    private dialog: MatDialog,
    private sessionService: SessionService,
    private authService: AuthService,
    private gtmTracking: GtmTrackingService,
    private router: Router,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => {
        this.isInnerPage = Boolean(option.inner);
      },
    });
  }

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

    if (this.router.url.includes('collection')) {
      return `${route}/collection/${this.router.url.split('/').pop() || ''}`;
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
      panelClass: ['modal', 'login-modal'],
      data: {
        isSignupActive: this.canRegister,
      },
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: 'modal',
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
