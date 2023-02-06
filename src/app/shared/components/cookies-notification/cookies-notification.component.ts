import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-cookies-notification',
  templateUrl: './cookies-notification.component.html',
  styleUrls: ['./cookies-notification.component.scss'],
})
export class CookiesNotificationComponent implements OnInit {
  public showCookies = true;
  readonly COOKIE_NAME = 'CookieAccepted';

  constructor(private cookieService: CookieService) {}

  ngOnInit() {
    this.cookieService.check(this.COOKIE_NAME);
  }

  public accept() {
    this.cookieService.set(
      this.COOKIE_NAME,
      new Date().toISOString(),
      365,
      undefined,
      undefined,
      true,
    );
    this.showCookies = false;
  }

  public decline() {
    this.showCookies = false;
  }
}
