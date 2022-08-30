import { Injectable } from '@angular/core';
import { EnvConfigInterface } from '@models';

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

    EnvService.ENV = envy;
    this.env = envy;
    return envy;
  }
}
