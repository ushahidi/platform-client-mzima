import { Injectable } from '@angular/core';
import { Share, ShareOptions } from '@capacitor/share';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  constructor(protected platform: Platform) {}

  public async share(options: ShareOptions): Promise<any> {
    if (!this.platform.is('capacitor')) return;
    await Share.share(options);
  }
}
