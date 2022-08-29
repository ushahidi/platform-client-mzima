import { Injectable } from '@angular/core';
import { EnvConfigInterface } from '@models';
import envJSON from 'src/env.json';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  static ENV: EnvConfigInterface;

  private env: EnvConfigInterface;

  get environment() {
    return this.env;
  }

  initEnv(): Promise<EnvConfigInterface> {
    EnvService.ENV = envJSON;
    this.env = envJSON;
    return Promise.resolve(envJSON);
  }
}
