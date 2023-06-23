import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly _networkStatus = new BehaviorSubject<any>(true);
  readonly networkStatus$ = this._networkStatus.asObservable();

  constructor() {
    this.listenToNetworkStatus();
  }

  async listenToNetworkStatus() {
    const connectionTypes = ['wifi', 'cellular'];
    Network.addListener('networkStatusChange', async (status: any) => {
      console.log('Network status changed', status);
      const { connected, connectionType } = status;
      this._networkStatus.next(connected && connectionTypes.includes(connectionType));
    });
  }
}
