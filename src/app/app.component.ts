import { Component, RendererFactory2 } from '@angular/core';
import { EnvService, LoaderService } from '@services';
import { IconService } from './core/services/icon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'platform-client';
  public isShowLoader = false;
  private renderer = this.rendererFactory.createRenderer(null, null);

  constructor(
    private loaderService: LoaderService, //
    private rendererFactory: RendererFactory2,
    protected env: EnvService,
    private iconService: IconService,
  ) {
    this.loaderService.isActive$.subscribe({
      next: (value) => {
        this.isShowLoader = value;
      },
    });
    if (this.env.environment.gtm_key) this.loadGtm();

    this.iconService.registerIcons();
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
}
