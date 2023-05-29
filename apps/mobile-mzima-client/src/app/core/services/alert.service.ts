import { Injectable } from '@angular/core';
import { AlertController, AlertOptions, IonicSafeString } from '@ionic/angular';

interface UshAlertOptions extends AlertOptions {
  isHTML?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private alertController: AlertController) {}

  public presentAlert(params: UshAlertOptions): Promise<any> {
    return new Promise((resolve) => {
      this.alertController
        .create({
          header: params.header,
          subHeader: params.subHeader,
          message: new IonicSafeString(String(params.message ?? '')),
          inputs: params.inputs,
          buttons: params.buttons ?? ['Ok'],
        })
        .then((alert) => {
          alert.present();
          alert.onWillDismiss().then((result) => {
            resolve(result);
          });
        });
    });
  }
}
