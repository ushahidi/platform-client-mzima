import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { SessionService, NetworkService, ToastService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-auth',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
})
export class AuthPage {
  public isKeyboardOpen = false;
  public isSignupActive = false;

  constructor(
    private platform: Platform,
    private sessionService: SessionService,
    private networkService: NetworkService,
    private toastService: ToastService,
    private translateService: TranslateService,
  ) {
    this.platform.keyboardDidShow.subscribe(() => {
      this.isKeyboardOpen = true;
    });

    this.platform.keyboardDidHide.subscribe(() => {
      this.isKeyboardOpen = false;
    });

    const siteConfig = this.sessionService.getSiteConfigurations();
    this.isSignupActive = !siteConfig.private && !siteConfig.disable_registration;

    this.sessionService.siteConfig$.pipe(untilDestroyed(this)).subscribe({
      next: (config) => {
        this.isSignupActive = !config.private && !config.disable_registration;
      },
    });
  }

  ionViewDidEnter() {
    if (!this.networkService.getCurrentNetworkStatus())
      this.toastService.presentToast({
        message: this.translateService.instant('app.info.auth_not_online'),
      });
  }

  ionViewDidLeave() {
    this.isSignupActive = false;
  }
}
