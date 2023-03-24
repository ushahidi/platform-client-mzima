import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LanguageInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  BreakpointService,
  EventBusService,
  EventType,
  IconService,
  LanguageService,
  LoaderService,
  SessionService,
} from '@services';
import { filter, Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'platform-client';
  public isShowLoader = false;
  public isDesktop$: Observable<boolean>;
  public languages: LanguageInterface[];
  public selectedLanguage$;
  public isInnerPage = false;
  public isRTL?: boolean;
  public isOnboardingDone = false;

  constructor(
    private loaderService: LoaderService,
    private iconService: IconService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
    private sessionService: SessionService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
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
  }

  ngOnInit() {
    this.setMetaData();
  }

  private getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    return activatedRoute.firstChild ? this.getChild(activatedRoute.firstChild) : activatedRoute;
  }

  private setMetaData(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const route = this.getChild(this.activatedRoute);

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

  private removeTags(tags: string[]) {
    for (const tag of tags) {
      this.metaService.removeTag(`property='${tag}'`);
    }
  }
}
