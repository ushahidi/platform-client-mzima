import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SessionService } from '@services';

@Component({
  selector: 'app-auth',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
})
export class AuthPage {
  public isKeyboardOpen = false;
  public isSignupActive = false;

  constructor(private platform: Platform, private sessionService: SessionService) {
    this.platform.keyboardDidShow.subscribe(() => {
      this.isKeyboardOpen = true;
    });

    this.platform.keyboardDidHide.subscribe(() => {
      this.isKeyboardOpen = false;
    });

    const siteConfig = this.sessionService.getSiteConfigurations();
    this.isSignupActive = !siteConfig.private && !siteConfig.disable_registration;
  }
}
