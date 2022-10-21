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
    const title = this.buildTitle(routerState);

    if (title) {
      this.title.setTitle(
        `${this.translateService.instant(title)} | ${this.session.getSiteConfigurations().name}`,
      );
    } else {
      this.title.setTitle(`${this.session.getSiteConfigurations().name}`);
    }
  }
}
