import { Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NetworkService } from './core/services/network.service';
import { ToastService } from './core/services/toast.service';

export class BaseComponent {
  tap = 0;

  constructor(
    protected router: Router,
    protected platform: Platform,
    protected toastService: ToastService,
    protected alertCtrl: AlertController,
    protected networkService: NetworkService,
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
    this.networkService.networkStatus$.pipe(untilDestroyed(this)).subscribe({
      next: async (value) => {
        if (value) {
          if (toast) {
            toast = await this.toastService.showToast(
              'The connection was restored',
              2000,
              'medium',
              'globe',
            );
            await toast.present();
          }
        } else {
          if (!toast) {
            toast = await this.toastService.showToast(
              'The connection is lost',
              2000,
              'medium',
              'globe',
            );
            await toast.present();
          }
        }
      },
    });
  }

  exitAppOnDoubleTap() {
    const urls = ['/', '/deployment'];
    if (Capacitor.getPlatform() === 'android') {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        if (urls.includes(this.router.url)) {
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
    const toast = await this.toastService.showToast('Tap back button again to exit the App');
    await toast.present();
    const dismiss = await toast.onDidDismiss();
    if (dismiss) {
      this.tap = 0;
    }
  }
}
