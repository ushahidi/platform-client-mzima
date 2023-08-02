import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { LoginComponent } from '@auth';
import { CollectionsComponent } from '../index';
import { EnumGtmEvent, EnumGtmSource } from '@enums';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  BreadcrumbService,
  BreakpointService,
  EventBusService,
  EventType,
  GtmTrackingService,
  SessionService,
} from '@services';
import { filter, Observable } from 'rxjs';
import { DonationModalComponent } from '../../../settings';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { SupportModalComponent } from '../support-modal/support-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() languages: any;
  @Input() selectedLanguage: any;
  private userData$: Observable<UserInterface>;
  public isDesktop$: Observable<boolean>;
  public isLoggedIn = false;
  public isDonateAvailable = false;
  public profile: UserInterface;
  public showSearchForm: boolean;
  public pageTitle: string;
  public isBurgerMenuOpen = false;
  public siteConfig: SiteConfigInterface;
  public menu: UserMenuInterface[];
  public isAdmin = false;
  public canRegister = false;
  public isInnerPage = false;
  public isSettingsPage = false;

  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private breakpointService: BreakpointService,
    private translate: TranslateService,
    private gtmTracking: GtmTrackingService,
    private eventBusService: EventBusService,
    private location: Location,
  ) {
    this.userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.siteConfig = this.session.getSiteConfigurations();
    this.isDonateAvailable = <boolean>this.session.getSiteConfigurations().donation?.enabled;

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
        label: 'nav.help_support',
        icon: 'info',
        visible: true,
        action: () => this.openSupportModal(),
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

  public showDonation(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
    });
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

  public openSupportModal(): void {
    this.dialog.open(SupportModalComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: ['modal', 'support-modal'],
    });
  }
}
