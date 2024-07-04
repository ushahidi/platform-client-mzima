import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

const CONNECTION_TYPES = ['wifi', 'cellular'];

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly _networkStatus = new BehaviorSubject<boolean>(false);
  readonly networkStatus$ = this._networkStatus.asObservable();

  constructor() {
    this.listenToNetworkStatus();
  }

  async listenToNetworkStatus() {
    Network.addListener('networkStatusChange', async (status: any) => {
      console.log('Network status changed', status);
      const { connected, connectionType } = status;
      this._networkStatus.next(connected && CONNECTION_TYPES.includes(connectionType));
    });
  }

  async checkNetworkStatus(): Promise<boolean> {
    const { connected, connectionType } = await Network.getStatus();
    return connected && CONNECTION_TYPES.includes(connectionType);
  }

  getCurrentNetworkStatus(): boolean {
    return this._networkStatus.getValue();
  }
}
