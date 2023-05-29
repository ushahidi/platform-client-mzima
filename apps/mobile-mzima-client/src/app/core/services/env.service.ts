import { inject, Injectable } from '@angular/core';
import { checkBackendURL } from '@helpers';
import { EnvConfigInterface } from '@models';

import { DeploymentService } from './deployment.service';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  static ENV: EnvConfigInterface;
  private env: EnvConfigInterface;
  private deploymentService = inject(DeploymentService);

  get environment() {
    return this.env;
  }

  async initEnv(): Promise<EnvConfigInterface> {
    const deployment: any = this.deploymentService.getDeployment();
    const envy: EnvConfigInterface = await fetch('./env.json').then((res) => res.json());
    if (deployment) {
      envy.backend_url = checkBackendURL(`${deployment.subdomain}.${deployment.domain}`);
    }

    EnvService.ENV = envy;
    this.env = envy;
    return envy;
  }
}
