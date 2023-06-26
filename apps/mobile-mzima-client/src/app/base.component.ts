import { Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs';
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

    this.doubleTapExistToast();

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
    this.networkService.networkStatus$
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe({
        next: async (value) => {
          await this.showConnectionInfo(
            value ? 'The connection was restored' : 'The connection is lost',
          );
        },
      });
  }

  async showConnectionInfo(message: string) {
    await this.toastService.presentToast({
      message,
      duration: 0,
      icon: 'globe',
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
    const result = await this.toastService.presentToast({
      message: 'Tap back button again to exit the App',
      buttons: [],
    });
    if (result) {
      this.tap = 0;
    }
  }
}
