import { Injectable } from '@angular/core';
import { envHelper } from '@helpers';
import { EnvConfigInterface } from '@models';
import { ApiUrlLoader } from '@mzima-client/sdk';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  static ENV: EnvConfigInterface;
  private env: EnvConfigInterface;

  get environment() {
    return this.env;
  }

  async initEnv(): Promise<EnvConfigInterface> {
    const envy: EnvConfigInterface = await fetch('./env.json').then((res) => res.json());
    const apiLoader = new ApiUrlLoader({ environment: envy });
    const apiUrl = await lastValueFrom(apiLoader.getApiUrl());

    envy.backend_url = envHelper.checkBackendURL(apiUrl);

    EnvService.ENV = envy;
    this.env = envy;
    return envy;
  }
}
