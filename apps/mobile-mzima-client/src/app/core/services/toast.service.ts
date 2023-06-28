import { Injectable } from '@angular/core';
import { ToastController, ToastOptions, IonicSafeString } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  public presentToast(params: ToastOptions): Promise<any> {
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
        })
        .then((toast) => {
          toast.present();
          toast.onWillDismiss().then((result) => {
            resolve(result);
          });
        });
    });
  }
}
