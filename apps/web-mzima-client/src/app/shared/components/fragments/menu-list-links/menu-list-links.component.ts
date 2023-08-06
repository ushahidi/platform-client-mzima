import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { SiteConfigInterface, MenuInterface } from '@models';
import { Observable } from 'rxjs';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GtmTrackingService, SessionService } from '@services';
import { EnumGtmEvent, EnumGtmSource, Permissions, Roles } from '@enums';
import { TranslateService } from '@ngx-translate/core';

@UntilDestroy() //Angular screams if this is not added even though it is already added in the NavToolbarService
@Component({
  selector: 'app-menu-list-links',
  templateUrl: './menu-list-links.component.html',
  styleUrls: ['./menu-list-links.component.scss'],
})
export class MenuListLinksComponent implements OnInit {
  public userData$: Observable<UserInterface>;
  public menu: MenuInterface[] = [];
  public isDesktop: boolean;
  public isLoggedIn: boolean;
  public siteConfig: SiteConfigInterface;
  public canRegister = false;
  public isHost = false;

  constructor(
    private navToolbarService: NavToolbarService,
    private session: SessionService,
    private gtmTracking: GtmTrackingService,
    private translate: TranslateService,
    private router: Router,
  ) {
    this.navToolbarService.getScreenSize().subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
        this.initNavigationMenu();
      },
    });
    this.userData$ = this.navToolbarService.getUserData(this);
    this.siteConfig = this.session.getSiteConfigurations();
  }

  ngOnInit(): void {
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
