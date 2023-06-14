import { Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';

export class BaseComponent {
  tap = 0;

  constructor(
    protected router: Router,
    protected platform: Platform,
    protected toastCtrl: ToastController,
    protected alertCtrl: AlertController,
    @Optional() protected routerOutlet?: IonRouterOutlet,
  ) {
    this.platform.ready().then(async () => {
      if (this.platform.is('hybrid')) {
        this.listenToNetworkStatus();
        this.exitAppOnDoubleTap();
      }
    });

    if (this.platform.is('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: true });

      const mediaDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
      this.setStatusBarColor(mediaDarkMode.matches);
      mediaDarkMode.addEventListener('change', (ev) => {
        this.setStatusBarColor(ev.matches);
      });
    }
  }

  private setStatusBarColor(isDark: boolean): void {
    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  }

  async listenToNetworkStatus() {
    let toast: any = null;
    Network.addListener('networkStatusChange', async (status: any) => {
      console.log('Network status changed', status);
      if (status.connected) {
        if (toast) {
          await toast.dismiss();
          toast = null;
        }
      } else {
        if (!toast) {
          toast = await this.showToast('The connection is lost', 0, 'medium', 'globe');
          await toast.present();
        }
      }
    });
  }

  exitAppOnDoubleTap() {
    if (Capacitor.getPlatform() === 'android') {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        // TODO add route on map
        if (this.router.url === '/deployment') {
          if (!this.routerOutlet?.canGoBack()) {
            this.tap++;
            if (this.tap === 2) await App.exitApp();
            else this.doubleTapExistToast();
          }
        }
      });
    }
  }

  async doubleTapExistToast() {
    const toast = await this.showToast('Tap back button again to exit the App');
    await toast.present();
    const dismiss = await toast.onDidDismiss();
    if (dismiss) {
      this.tap = 0;
    }
  }

  showToast(message: string, duration = 3000, color = 'primary', icon?: string) {
    return this.toastCtrl.create({
      mode: 'ios',
      message,
      duration,
      position: 'bottom',
      color,
      icon,
    });
  }
}
