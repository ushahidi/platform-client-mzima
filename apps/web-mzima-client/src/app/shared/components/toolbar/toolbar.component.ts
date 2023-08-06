import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreadcrumbService, EventBusService, EventType, SessionService } from '@services';
import { filter, Observable } from 'rxjs';
import { NavToolbarService } from '../../helpers/navtoolbar.service';

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
  public isLoggedIn: boolean;
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
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private eventBusService: EventBusService,
    private location: Location,
    private navToolbarService: NavToolbarService,
  ) {
    this.userData$ = this.navToolbarService.getUserData(this);
    this.isDesktop$ = this.navToolbarService.getScreenSizeAsync(this);
    this.siteConfig = this.session.getSiteConfigurations(); // Remove this line?
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
    });
  }

  public openAccountSettings(): void {
    this.navToolbarService.openAccountSettings();
  }

  public logout(): void {
    this.navToolbarService.logout();
  }

  public toggleBurgerMenu(): void {
    this.navToolbarService.toggleBurgerMenu(); //toggles true & false for hamburger button
  }

  public back(): void {
    this.location.back();
  }
}
