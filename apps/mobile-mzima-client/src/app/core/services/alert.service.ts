import { Injectable } from '@angular/core';
import { AlertController, AlertOptions, IonicSafeString } from '@ionic/angular';

interface UshAlertOptions extends AlertOptions {
  isHTML?: boolean;
  icon?: {
    name: string;
    color?: string;
  };
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
          buttons: params.buttons ?? [
            {
              text: 'Ok',
              cssClass: 'primary',
            },
          ],
        })
        .then(async (alert) => {
          await alert.present();
          if (params.icon) {
            const icon = document.createElement('ion-icon');
            icon.setAttribute('name', params.icon.name);
            icon.classList.add('custom-alert-icon');
            icon.classList.add(`ion-color-${params.icon.color}`);

            const headerElement = alert.querySelector('.alert-head');
            if (headerElement) {
              headerElement.insertBefore(icon, headerElement.firstChild);
            }
          }
          alert.onWillDismiss().then((result) => {
            resolve(result);
          });
        });
    });
  }
}
