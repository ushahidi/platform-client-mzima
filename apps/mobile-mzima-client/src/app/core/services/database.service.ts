import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
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

  public async get(key: string) {
    await this.ready();
    return this._storage?.get(key);
  }
}
