import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-auth',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
})
export class AuthPage {
  public isKeyboardOpen = false;

  constructor(private platform: Platform) {
    this.platform.keyboardDidShow.subscribe(() => {
      this.isKeyboardOpen = true;
    });

    this.platform.keyboardDidHide.subscribe(() => {
      this.isKeyboardOpen = false;
    });
  }
}
