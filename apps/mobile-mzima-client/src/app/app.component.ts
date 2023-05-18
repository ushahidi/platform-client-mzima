import { Component, Optional } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonRouterOutlet, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'mobile-mzima-client';
  tap = 0;

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    @Optional() private routerOutlet?: IonRouterOutlet,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      if (this.platform.is('hybrid')) {
        this.exitAppOnDoubleTap();
      }
    });
  }

  exitAppOnDoubleTap() {
    if (Capacitor.getPlatform() === 'android') {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        if (!this.routerOutlet?.canGoBack()) {
          this.tap++;
          if (this.tap === 2) await App.exitApp();
          else await this.doubleTapExistToast();
        }
      });
    }
  }

  async doubleTapExistToast() {
    const toast = await this.toastCtrl.create({
      message: 'Tap back button again to exist the App',
      duration: 3000,
      position: 'bottom',
      color: 'primary',
    });
    await toast.present();
    const dismiss = await toast.onDidDismiss();
    if (dismiss) {
      this.tap = 0;
    }
  }
}
