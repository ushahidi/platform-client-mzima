import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { LoginComponent } from '@auth';
import { CollectionsComponent } from '@data';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  BreadcrumbService,
  BreakpointService,
  EventBusService,
  EventType,
  SessionService,
} from '@services';
import { filter } from 'rxjs';
import { BaseComponent } from '../../../base.component';
import { AccountSettingsModalComponent } from '../account-settings-modal/account-settings-modal.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { SupportModalComponent } from '../support-modal/support-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent extends BaseComponent implements OnInit {
  @Input() languages: any;
  @Input() selectedLanguage: any;
  public isDonateAvailable = false;
  public showSearchForm: boolean;
  public pageTitle: string;
  public isBurgerMenuOpen = false;
  public siteConfig: SiteConfigInterface;
  public menu: UserMenuInterface[];
  public isAdmin = false;
  public canRegister = false;
  public isInnerPage = false;
  public isSettingsPage = false;
  public isToastMessageVisible = false;
  public currentApiVersion = '';

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private location: Location,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    this.siteConfig = this.sessionService.getSiteConfigurations();
    this.isDonateAvailable = <boolean>this.sessionService.getSiteConfigurations().donation?.enabled;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.routerState.snapshot.url;
      this.showSearchForm = url.indexOf('/map') > -1 || url.indexOf('/feed') > -1;
      this.isSettingsPage = url.indexOf('/settings') > -1;
    });

    this.breadcrumbService.breadcrumbs$.pipe(untilDestroyed(this)).subscribe({
      next: (res) => (this.pageTitle = res[res.length - 1]?.instance),
    });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => {
        this.isInnerPage = Boolean(option.inner);
      },
    });

    this.checkApiVersion();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  loadData(): void {
    this.isAdmin = this.user.role === 'admin';
    this.canRegister = !this.siteConfig.private && !this.siteConfig.disable_registration;
    this.initMenu();
  }

  private checkApiVersion(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (userData) => {
        this.isAdmin = userData?.role === 'admin';
        if (this.isAdmin && this.currentApiVersion !== 'v5') {
          this.isToastMessageVisible = true;
        }
      },
    });

    this.currentApiVersion = this.sessionService.getSiteConfigurations().api_version ?? 'v3';
    if (this.currentApiVersion !== 'v5') {
      const apiMesssageShownTime = JSON.parse(
        localStorage.getItem(
          this.sessionService.getLocalStorageNameMapper('outdated_api_message_shown'),
        ) ?? '0',
      );

      const twentyFourHours = 24 * 60 * 60 * 1000;
      const currentTime = Date.now();

      if (currentTime > apiMesssageShownTime + twentyFourHours) {
        this.isToastMessageVisible = true;
      }
    }
  }

  public closeToastMessage(): void {
    this.isToastMessageVisible = false;
    localStorage.setItem(
      this.sessionService.getLocalStorageNameMapper('outdated_api_message_shown'),
      JSON.stringify(Date.now()),
    );
  }

  private initMenu() {
    this.menu = [
      {
        label: 'nav.collections',
        icon: 'collections',
        visible: !this.siteConfig.private || this.isLoggedIn,
        action: () => this.openCollections(),
      },
      {
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.openSupportModal(),
      },
      {
        label: 'nav.my_account',
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
        label: 'nav.login_register',
        icon: 'auth',
        visible: !this.isLoggedIn && this.canRegister,
        action: () => this.openLogin(),
      },
    ];
  }

  public openSettings(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(AccountSettingsModalComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: ['modal', 'account-settings-modal'],
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
      data: {
        title: this.translate.instant(this.pageTitle),
        description: this.translate.instant(this.pageTitle),
      },
    });
  }

  public toggleBurgerMenu(value?: boolean): void {
    this.isBurgerMenuOpen = value ?? !this.isBurgerMenuOpen;
    if (this.isBurgerMenuOpen) {
      document.body.classList.add('burger-menu-open');
    } else {
      document.body.classList.remove('burger-menu-open');
    }
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

  public openSupportModal(): void {
    this.dialog.open(SupportModalComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: ['modal', 'support-modal'],
    });
  }
}
