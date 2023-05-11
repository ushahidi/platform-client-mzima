import { Injectable } from '@angular/core';
import { AlertController, AlertOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private alertController: AlertController) {}

  public presentAlert(params: AlertOptions): Promise<any> {
    return new Promise((resolve) => {
      this.alertController
        .create({
          header: params.header,
          subHeader: params.subHeader,
          message: params.message,
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
