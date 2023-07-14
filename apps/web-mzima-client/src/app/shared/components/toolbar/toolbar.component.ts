import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { EnumGtmEvent, EnumGtmSource } from '@enums';
import { SiteConfigInterface, UserMenuInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  BreadcrumbService,
  EventBusService,
  EventType,
  GtmTrackingService,
  SessionService,
} from '@services';
import { filter, Observable } from 'rxjs';
import { DonationModalComponent } from '../../../settings';
import { NavToolbarService } from '../../services/shared.navtoolbar.service';

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
  public siteConfig: SiteConfigInterface;
  public menu: UserMenuInterface[];
  public isAdmin = false;
  public isInnerPage = false;
  public isSettingsPage = false;

  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private translate: TranslateService,
    private gtmTracking: GtmTrackingService,
    private eventBusService: EventBusService,
    private location: Location,
    private navToolbarService: NavToolbarService,
  ) {
    this.userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
    this.isDesktop$ = this.navToolbarService.getScreenSize2(this);
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
    });
  }

  public showDonation(): void {
    this.navToolbarService.toggleBurgerMenu(false);
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
    });
  }

  public openAccountSettings(): void {
    this.navToolbarService.openAccountSettings();
  }

  public logout(): void {
    this.navToolbarService.logout();
  }

  public toggleBurgerMenu(): void {
    this.navToolbarService.toggleBurgerMenu(); //true - false toggle
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

  public back(): void {
    this.location.back();
  }

  openShare() {
    this.navToolbarService.openShare(this.pageTitle);
  }
}
