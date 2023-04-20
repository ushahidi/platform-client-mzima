import { Component, OnInit, RendererFactory2 } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EnvService } from '../../../core/services/env.service';

@Component({
  selector: 'app-cookies-notification',
  templateUrl: './cookies-notification.component.html',
  styleUrls: ['./cookies-notification.component.scss'],
})
export class CookiesNotificationComponent implements OnInit {
  public showCookies = true;
  readonly COOKIE_NAME = 'CookieAccepted';

  constructor(
    private cookieService: CookieService,
    private rendererFactory: RendererFactory2,
    protected env: EnvService,
  ) {
    if (this.env.environment.gtm_key) this.loadGtm();
  }

  ngOnInit() {
    this.showCookies = !this.cookieService.check(this.COOKIE_NAME);
  }

  public accept() {
    this.setCookies(true);
    this.showCookies = false;
    this.loadGtm();
  }

  public decline() {
    this.setCookies(false);
    this.showCookies = false;
  }

  private setCookies(isAccepted: boolean): void {
    this.cookieService.set(
      this.COOKIE_NAME,
      JSON.stringify(isAccepted),
      30,
      undefined,
      undefined,
      true,
    );
  }

  private loadGtm() {
    const cookies = JSON.parse(
      this.checkCookiesValue(this.cookieService.get(this.COOKIE_NAME)) || 'false',
    );
    if (!cookies) return;

    const renderer = this.rendererFactory.createRenderer(null, null);
    const script = renderer.createElement('script');
    script.async = true;
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${this.env.environment.gtm_key}');`;

    renderer.appendChild(document.head, script);

    const div = document.createElement('div');
    div.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${this.env.environment.gtm_key}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    renderer.appendChild(document.body, div);
  }

  private checkCookiesValue(value: string) {
    if (value === 'false' || value === 'true') {
      return value;
    } else {
      this.cookieService.delete(this.COOKIE_NAME);
      return 'false';
    }
  }
}
