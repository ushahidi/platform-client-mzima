import { Injectable } from '@angular/core';
import { EnvService } from '@services';
import { SwitchApiService } from '@mzima-client/sdk';

@Injectable({
  providedIn: 'root',
})
export class ListenerService {
  constructor(private envService: EnvService, private switchApiService: SwitchApiService) {}

  public changeDeploymentListener(): void {
    this.envService.deployment$.subscribe({
      next: () => {
        this.switchApiService.switchApi();
      },
    });
  }
}
