import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { UserInterface, UserMenuInterface } from '@models';
import {
  AuthService,
  BreadcrumbService,
  SessionService,
  BreakpointService,
  GtmTrackingService,
  EventBusService,
  EventType,
} from '@services';
import { filter } from 'rxjs';
import { DonationModalComponent } from 'src/app/settings';
import { AccountSettingsComponent } from '../account-settings/account-settings.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { EnumGtmEvent, EnumGtmSource } from '@enums';
import { CollectionsComponent } from '@data';
import { LoginComponent } from '@auth';
import { Location } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() languages: any;
  @Input() selectedLanguage: any;
  private userData$ = this.session.currentUserData$;
  public isLoggedIn = false;
  public isDonateAvailable = false;
  public profile: UserInterface;
  public showSearchForm: boolean;
  public pageTitle: string;
  public isDesktop = false;
  public isBurgerMenuOpen = false;
  public siteConfig = this.sessionService.getSiteConfigurations();
  public menu: UserMenuInterface[];
  public isAdmin = false;
  public canRegister = false;
  public isInnerPage = false;

  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private readonly breadcrumbService: BreadcrumbService,
    private breakpointService: BreakpointService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private gtmTracking: GtmTrackingService,
    private eventBusService: EventBusService,
    private location: Location,
  ) {
    this.isDonateAvailable = this.session.getSiteConfigurations().donation?.enabled!;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.routerState.snapshot.url;
      this.showSearchForm = url.indexOf('/map') > -1 || url.indexOf('/feed') > -1;
    });

    this.breadcrumbService.breadcrumbs$.subscribe({
      next: (res) => {
        this.pageTitle = res[res.length - 1]?.instance;
      },
    });

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

  ngOnInit(): void {
    this.userData$.subscribe((userData) => {
      this.profile = userData;
      this.isLoggedIn = !!userData.userId;
      this.isAdmin = userData.role === 'admin';
      this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
      this.initMenu();
    });
  }

  private initMenu() {
    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: true,
        action: () => this.openCollections(),
      },
      {
        label: 'Help&Support',
        icon: 'auth',
        visible: true,
        action: () => {},
      },
      {
        label: 'My account',
        icon: 'account',
        visible: this.isLoggedIn,
        action: () => this.openSettings(),
        separator: true,
      },
      {
        label: 'nav.logout',
        icon: 'logout',
        visible: this.isLoggedIn,
        action: () => this.logout(),
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
    ];
  }

  public showDonation(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
    });
  }

  public openSettings(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(AccountSettingsComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: 'modal',
    });
  }

  public logout(): void {
    this.authService.logout();
  }

  public openShare() {
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
    });
  }

  public toggleBurgerMenu(value?: boolean): void {
    this.isBurgerMenuOpen = value ?? !this.isBurgerMenuOpen;
  }

  createRouterLink(route: string) {
    if (route !== 'map' && route !== 'feed') return route;
    return this.router.url.includes('collection')
      ? `${route}/collection/${this.router.url.split('/').pop() || ''}`
      : route;
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

  private openCollections(): void {
    this.toggleBurgerMenu(false);
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: '768px',
      panelClass: ['modal', 'collections-modal'],
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private openLogin(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'login-modal'],
      data: {
        isSignupActive: this.canRegister,
      },
    });
  }

  public back(): void {
    this.location.back();
  }
}
