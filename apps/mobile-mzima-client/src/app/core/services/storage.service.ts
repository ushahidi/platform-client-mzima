import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setStorage(key: string, value: any, type?: string) {
    return type
      ? localStorage.setItem(key, JSON.stringify(value))
      : localStorage.setItem(key, value);
  }

  getStorage(key: string, type?: string) {
    return type ? JSON.parse(localStorage.getItem(key)!) : localStorage.getItem(key);
  }

  deleteStorage(key: string) {
    return localStorage.removeItem(key);
  }

  clearStorage() {
    return localStorage.clear();
  }
}
