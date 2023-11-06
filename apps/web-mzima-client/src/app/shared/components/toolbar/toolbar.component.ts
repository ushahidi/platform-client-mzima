import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { NavToolbarService } from '../../helpers/navtoolbar.service';

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
  public isInnerPage = false;
  public isSettingsPage = false;
  public isToastMessageVisible = false;
  public currentApiVersion = '';

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private eventBusService: EventBusService,
    private location: Location,
    private navToolbarService: NavToolbarService,
    private authService: AuthService,
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
  }

  ngOnInit(): void {
    this.getUserData();
  }

  loadData(): void {
    this.isAdmin = this.user.role === 'admin';
  }

  public openAccountSettings(): void {
    this.navToolbarService.openAccountSettings();
  }

  public logout(): void {
    this.authService.logout();
  }

  public toggleBurgerMenu(): void {
    this.navToolbarService.toggleBurgerMenu(); //toggles true & false for hamburger button
  }

  public back(): void {
    this.location.back();
  }
}
