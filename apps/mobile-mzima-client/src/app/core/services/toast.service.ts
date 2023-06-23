import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(protected toastCtrl: ToastController) {}

  async showToast(message: string, duration = 3000, color = 'primary', icon?: string) {
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
