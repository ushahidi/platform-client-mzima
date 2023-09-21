import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LanguageInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  BreakpointService,
  EnvService,
  EventBusService,
  EventType,
  GtmTrackingService,
  IconService,
  LanguageService,
  LoaderService,
  SessionService,
} from '@services';
import { filter } from 'rxjs';
import { BaseComponent } from './base.component';
import { EnumGtmEvent } from './core/enums/gtm';
import { Intercom } from '@supy-io/ngx-intercom';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent implements OnInit {
  public isShowLoader = false;
  public languages: LanguageInterface[];
  public selectedLanguage$;
  public isInnerPage = false;
  public isRTL?: boolean;
  public isOnboardingDone = false;
  public showOnboarding = true;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private loaderService: LoaderService,
    private iconService: IconService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private metaService: Meta,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private env: EnvService,
    private gtm: GtmTrackingService,
    private intercom: Intercom,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    this.selectedLanguage$ = this.languageService.selectedLanguage$.pipe(untilDestroyed(this));

    this.loaderService.isActive$.pipe(untilDestroyed(this)).subscribe({
      next: (value) => {
        this.isShowLoader = value;
      },
    });

    this.iconService.registerIcons();

    this.languageService.isRTL$.pipe(untilDestroyed(this)).subscribe({
      next: (isRTL) => {
        if (this.isRTL !== isRTL) {
          this.isRTL = isRTL;
          const html: HTMLElement = document.getElementsByTagName('html')[0];
          if (isRTL) {
            html.classList.add('rtl');
            html.setAttribute('dir', 'rtl');
          } else {
            html.classList.remove('rtl');
            html.removeAttribute('dir');
          }
        }
      },
    });

    this.gtm.setConfigLayer(this.sessionService.getSiteConfigurations());

    this.languageService.languages$
      .pipe(untilDestroyed(this))
      .subscribe((langs: LanguageInterface[]) => {
        const initialLanguage = this.languageService.initialLanguage;
        this.languages = langs.sort((lang: LanguageInterface) => {
          return lang.code == initialLanguage ? -1 : 0;
        });
      });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => (this.isInnerPage = Boolean(option.inner)),
    });

    this.eventBusService.on(EventType.ShowOnboarding).subscribe({
      next: () => (this.isOnboardingDone = false),
    });

    const isOnboardingDone = localStorage.getItem(
      this.sessionService.getLocalStorageNameMapper('is_onboarding_done')!,
    );
    this.isOnboardingDone = isOnboardingDone ? JSON.parse(isOnboardingDone) : false;

    this.showOnboarding = this.shouldShowOnboarding(window.location.href);
  }

  private shouldShowOnboarding(url: string): boolean {
    const allowedPaths = ['/', '/feed', '/map'];

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      console.error('Invalid URL:', url);
      return false;
    }

    const path = urlObj.pathname;

    if (allowedPaths.includes(path)) {
      if (path === '/feed') {
        const params = urlObj.searchParams;
        const paramKeys = params
          .toString()
          .split('&')
          .map((param) => param.split('=')[0]);
        return params.has('page') && params.get('page') === '1' && paramKeys.length === 1;
      }
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.getUserData();
    this.setMetaData();
  }

  private getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    return activatedRoute.firstChild ? this.getChild(activatedRoute.firstChild) : activatedRoute;
  }

  private setMetaData(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const route = this.getChild(this.activatedRoute);
        this.gtm.registerEvent(
          { event: EnumGtmEvent.PageView },
          { url: (event as NavigationEnd).url },
        );
        route.data.subscribe((data: any) => {
          this.metaService.updateTag({
            name: 'twitter:card',
            content: 'summary',
          });
          data.description
            ? this.metaService.updateTag({
                name: 'description',
                content: this.translate.instant(data.description),
              })
            : this.removeTags(['description']);

          data.ogUrl
            ? this.metaService.updateTag({
                property: 'og:url',
                content: data.ogUrl,
              })
            : this.metaService.updateTag({
                property: 'og:url',
                content: window.location.href,
              });

          data.ogTitle
            ? this.saveOgTitle(data.ogTitle)
            : this.removeTags(['og:title', 'twitter:title', 'twitter:description']);

          data.ogDescription
            ? this.metaService.updateTag({
                property: 'og:description',
                content: this.translate.instant(data.ogDescription),
              })
            : this.removeTags(['og:description']);

          data.ogImage
            ? this.metaService.updateTag({
                property: 'og:image',
                content: data.ogImage,
              })
            : this.removeTags(['og:image']);
        });
      });
  }

  private saveOgTitle(ogTitle: string) {
    const title = this.translate.instant(ogTitle);
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: title });
    sessionStorage.setItem('ogTitle', this.translate.instant(ogTitle));
  }

  loadData(): void {
    const user: UserInterface = this.user;
    if (!user.userId) return this.intercom.shutdown();
    const site = this.sessionService.getSiteConfigurations();
    const parsedUrl = new URL(window.location.href);
    const domain = parsedUrl.origin;

    const io = {
      app_id: this.env.environment.intercom_appid,
      custom_launcher_selector: '.intercom_custom_launcher',
      email: user.email,
      created_at: user.created?.getDate(),
      user_id: `${domain}_${user.userId}`,
      deployment_url: domain,
      realname: user.realname,
      last_login: user.last_login,
      role: user.role,
      company: {
        company_id: String(site.id),
        name: String(site.name),
        id: domain,
        created_at: 0, // Faking this because we don't have this data
        plan: site.tier,
      },
    };
    this.intercom.boot(io);
  }

  private removeTags(tags: string[]) {
    for (const tag of tags) {
      this.metaService.removeTag(`property='${tag}'`);
    }
  }
}
