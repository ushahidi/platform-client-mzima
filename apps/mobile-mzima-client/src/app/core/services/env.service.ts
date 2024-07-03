import { inject, Injectable } from '@angular/core';
import { checkBackendURL } from '@helpers';
import { EnvConfigInterface } from '@models';

import { DeploymentService } from '@services';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  static ENV: EnvConfigInterface;
  private env: EnvConfigInterface;
  private deploymentService = inject(DeploymentService);
  public deployment = new BehaviorSubject<any>(null);
  readonly deployment$ = this.deployment.asObservable();

  get environment() {
    return this.env;
  }

  async initEnv(): Promise<EnvConfigInterface> {
    const envy: EnvConfigInterface = await fetch('./env.json').then((res) => res.json());
    envy['backend_url'] = null;
    if (this.deploymentUrl) {
      envy.backend_url = this.deploymentUrl;
    }
    EnvService.ENV = envy;
    this.env = envy;
    return envy;
  }

  get deploymentUrl(): string | null {
    const deployment: any = this.deploymentService.getDeployment();
    let url = null;
    if (deployment) {
      const subdomain =
        deployment.subdomain && deployment.subdomain !== '' ? `${deployment.subdomain}.` : '';
      url = checkBackendURL(`${subdomain}${deployment.domain}`);
    }
    return url;
  }

  setDynamicBackendUrl() {
    const deployment: any = this.deploymentService.getDeployment();
    const envy: EnvConfigInterface = this.env;
    envy.backend_url = this.deploymentUrl;
    EnvService.ENV = envy;
    this.env = envy;
    this.deployment.next(deployment);
  }
}
