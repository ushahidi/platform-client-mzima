import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class UshahidiPageTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    private translateService: TranslateService,
    private session: SessionService,
  ) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const route = routerState.url.split('/')[1];
    const currentRoute = route.charAt(0).toUpperCase() + route.slice(1); // To capitalize first letter

    if (currentRoute) {
      const translatedRoute = this.translateService.instant(currentRoute);
      this.title.setTitle(`${translatedRoute} | ${this.session.getSiteConfigurations().name}`);
    } else {
      this.title.setTitle(`${this.session.getSiteConfigurations().name}`);
    }
  }
}
