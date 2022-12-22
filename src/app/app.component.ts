import { Component, OnInit, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EnvService, LanguageService, LoaderService } from '@services';
import { filter } from 'rxjs';
import { IconService } from './core/services/icon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'platform-client';
  public isShowLoader = false;
  private renderer = this.rendererFactory.createRenderer(null, null);
  public languages$;
  public selectedLanguage$;

  constructor(
    private loaderService: LoaderService, //
    private rendererFactory: RendererFactory2,
    protected env: EnvService,
    private iconService: IconService,
    private languageService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    private translate: TranslateService,
  ) {
    this.loaderService.isActive$.subscribe({
      next: (value) => {
        this.isShowLoader = value;
      },
    });
    if (this.env.environment.gtm_key) this.loadGtm();

    this.iconService.registerIcons();
    this.selectedLanguage$ = this.languageService.selectedLanguage$;
    this.languages$ = this.languageService.languages$;
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
        data.description
          ? this.metaService.updateTag({
              name: 'description',
              content: this.translate.instant(data.description),
            })
          : this.metaService.removeTag("name='description'");

        data.ogUrl
          ? this.metaService.updateTag({ property: 'og:url', content: data.ogUrl })
          : this.metaService.updateTag({ property: 'og:url', content: window.location.href });

        data.ogTitle
          ? this.saveOgTitle(data.ogTitle)
          : this.metaService.removeTag("property='og:title'");

        data.ogDescription
          ? this.metaService.updateTag({
              property: 'og:description',
              content: this.translate.instant(data.ogDescription),
            })
          : this.metaService.removeTag("property='og:description'");

        data.ogImage
          ? this.metaService.updateTag({ property: 'og:image', content: data.ogImage })
          : this.metaService.removeTag("property='og:image'");
      });
    });
  }

  private saveOgTitle(ogTitle: string) {
    this.metaService.updateTag({ property: 'og:title', content: this.translate.instant(ogTitle) });
    sessionStorage.setItem('ogTitle', this.translate.instant(ogTitle));
  }
}
