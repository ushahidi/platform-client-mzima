import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AuthService,
  BreadcrumbService,
  BreakpointService,
  EnvService,
  EventBusService,
  EventType,
  SessionService,
} from '@services';
import { filter, timer } from 'rxjs';
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
  public unreadCount = 0;
  private unreadRefreshedAt = Math.floor(Date.now() / 1000);
  private lastPageTitle?: string;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private eventBusService: EventBusService,
    private location: Location,
    private navToolbarService: NavToolbarService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private env: EnvService,
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
      next: (res) => {
        const nextTitle = res[res.length - 1]?.instance;
        if (this.shouldResetUnreadTimestamp(this.pageTitle, nextTitle)) {
          this.resetUnreadTimestamp();
          this.fetchUnreadCount();
        }
        this.pageTitle = nextTitle;
        this.lastPageTitle = nextTitle;
      },
    });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => {
        this.isInnerPage = Boolean(option.inner);
      },
    });
  }

  ngOnInit(): void {
    this.getUserData();
    this.startUnreadPolling();
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

    // Since the mobile-menu element is removed from the DOM initially and every other time that this.isBurgerMenuOpen is false,
    // We are therefore not able to access the @Output EventEmitter on it
    // Calling this method here helps to restore the mobile-menu element back through the toggle button click, so that we can have access to the mobile-menu element and the @Output EventEmitter on it
    this.getIsBurgerMenuOpen(!this.isBurgerMenuOpen);
  }

  public getIsBurgerMenuOpen(value: boolean) {
    this.isBurgerMenuOpen = value;
  }

  public back(): void {
    this.location.back();
  }

  public refreshPage(): void {
    window.location.reload();
  }

  private startUnreadPolling(): void {
    this.resetUnreadTimestamp();

    timer(0, 60000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.fetchUnreadCount();
      });
  }

  private fetchUnreadCount(): void {
    const params = new HttpParams().set('refreshed_at', this.unreadRefreshedAt.toString());

    this.httpClient
      .get<any>(`${this.env.environment.backend_url + this.env.environment.api_v5}posts/unread`, {
        params,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          const count = this.extractUnreadCount(response);
          this.unreadCount = Number.isFinite(count) ? count : 0;
        },
        error: () => {
          this.unreadCount = 0;
        },
      });
  }

  private extractUnreadCount(response: any): number {
    if (typeof response === 'number') return response;
    if (!response || typeof response !== 'object') return 0;

    const directCount = response.count ?? response.unread;
    if (Number.isFinite(Number(directCount))) return Number(directCount);

    const nestedCount = response.result?.count ?? response.result?.unread;
    return Number.isFinite(Number(nestedCount)) ? Number(nestedCount) : 0;
  }

  private resetUnreadTimestamp(): void {
    this.unreadRefreshedAt = Math.floor(Date.now() / 1000);
  }

  private shouldResetUnreadTimestamp(previous?: string, next?: string): boolean {
    if (!previous || !next || previous === next) return false;
    return this.isViewBreadcrumb(previous) && this.isViewBreadcrumb(next);
  }

  private isViewBreadcrumb(value: string): boolean {
    return value === 'nav.map' || value === 'nav.feed';
  }
}
