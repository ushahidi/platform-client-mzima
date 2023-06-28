import { Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Dialog } from '@capacitor/dialog';
import { NativeSettings, IOSSettings } from 'capacitor-native-settings';

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
      this.logDeviceInfo();
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

  private async logDeviceInfo() {
    const info = await Device.getInfo();

    const showConfirm = async () => {
      const { value } = await Dialog.confirm({
        title: 'Update',
        message: `For the application to work correctly, please update your iOS`,
      });

      if (value) {
        NativeSettings.openIOS({
          option: IOSSettings.SoftwareUpdate,
        });
      }
    };

    const osArray = info.osVersion.split('.');
    const intOSVersion = parseInt(`${osArray[0]}0${osArray[1]}`);

    if (info.platform === 'ios' && intOSVersion < 1605) {
      await showConfirm();
    }
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
    const toast = await this.toastService.showToast(message, 3000, 'medium', 'globe');
    await toast.present();
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
