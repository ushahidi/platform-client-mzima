import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonRouterOutlet, Platform, ToastController } from '@ionic/angular';
import { BaseComponent } from './base.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent {
  title = 'mobile-mzima-client';

  constructor(
    override router: Router,
    override platform: Platform,
    override toastCtrl: ToastController,
    override alertCtrl: AlertController,
    @Optional() override routerOutlet?: IonRouterOutlet,
  ) {
    super(router, platform, toastCtrl, alertCtrl, routerOutlet);
  }
}
