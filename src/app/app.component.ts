import { Component, OnInit, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LanguageInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  EnvService,
  LanguageService,
  LoaderService,
  EventBusService,
  EventType,
  BreakpointService,
} from '@services';
import { filter } from 'rxjs';
import { IconService } from './core/services/icon.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'platform-client';
  public isShowLoader = false;
  private renderer = this.rendererFactory.createRenderer(null, null);
  private languages$ = this.languageService.languages$.pipe(untilDestroyed(this));
  private isRTL$ = this.languageService.isRTL$.pipe(untilDestroyed(this));
  public isDesktop$ = this.breakpointService.isDesktop$;
  public languages: LanguageInterface[];
  public selectedLanguage$;
  public isInnerPage = false;
  public isRTL?: boolean;

  constructor(
    private loaderService: LoaderService,
    private rendererFactory: RendererFactory2,
    protected env: EnvService,
    private iconService: IconService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.loaderService.isActive$.subscribe({
      next: (value) => {
        this.isShowLoader = value;
      },
    });
    if (this.env.environment.gtm_key) this.loadGtm();

    this.iconService.registerIcons();
    this.selectedLanguage$ = this.languageService.selectedLanguage$;

    this.isRTL$.subscribe({
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

    this.languages$.subscribe((langs) => {
      const initialLanguage = this.languageService.initialLanguage;
      this.languages = langs.sort((lang) => {
        return lang.code == initialLanguage ? -1 : 0;
      });
    });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => (this.isInnerPage = Boolean(option.inner)),
    });
  }

  ngOnInit() {
    this.setMetaData();
  }

  private loadGtm() {
    const script = this.renderer.createElement('script');
    script.async = true;
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${this.env.environment.gtm_key}');`;

    this.renderer.appendChild(document.head, script);

    const div = document.createElement('div');
    div.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${this.env.environment.gtm_key}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    this.renderer.appendChild(document.body, div);
  }

  private getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    return activatedRoute.firstChild ? this.getChild(activatedRoute.firstChild) : activatedRoute;
  }

  private setMetaData(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.getChild(this.activatedRoute);

      route.data.subscribe((data: any) => {
        this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
        data.description
          ? this.metaService.updateTag({
              name: 'description',
              content: this.translate.instant(data.description),
            })
          : this.removeTags(['description']);

        data.ogUrl
          ? this.metaService.updateTag({ property: 'og:url', content: data.ogUrl })
          : this.metaService.updateTag({ property: 'og:url', content: window.location.href });

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
          ? this.metaService.updateTag({ property: 'og:image', content: data.ogImage })
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
