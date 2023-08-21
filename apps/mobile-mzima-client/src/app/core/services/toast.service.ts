import { Injectable } from '@angular/core';
import { ToastController, ToastOptions, IonicSafeString } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast?: HTMLIonToastElement;

  constructor(private toastController: ToastController) {}

  public presentToast(params: ToastOptions): Promise<any> {
    this.toast?.dismiss();
    return new Promise((resolve) => {
      this.toastController
        .create({
          header: params.header,
          cssClass: 'custom-toast',
          message: new IonicSafeString(String(params.message ?? '')),
          buttons: params.buttons ?? ['Ok'],
          duration: params.duration ?? 2000,
          layout: params.layout ?? 'baseline',
          position: params.position ?? 'bottom',
          icon: params.icon,
          color: params.color ?? undefined,
        })
        .then((toast) => {
          this.toast = toast;
          toast.present();
          toast.onWillDismiss().then((result) => {
            resolve(result);
          });
        });
    });
  }
}
