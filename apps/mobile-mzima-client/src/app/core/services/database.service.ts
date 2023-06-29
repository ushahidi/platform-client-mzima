import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private toastService: ToastService) {
    this.init();
  }

  public async ready(): Promise<void> {
    while (!this._storage) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  async init() {
    this._storage = await this.storage.create();
  }

  public async set(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  public async clear() {
    await this._storage?.clear();
  }

  public async get(key: string) {
    this.toastService.presentToast({
      message: `${this.getKeyName(key)} got from the local database`,
    });
    await this.ready();
    return this._storage?.get(key);
  }

  private getKeyName(key: string): string {
    switch (key) {
      case 'geoJsonPosts':
        return 'Map markers';

      default:
        return key;
    }
  }
}
