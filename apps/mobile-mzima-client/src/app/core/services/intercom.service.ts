import { Injectable } from '@angular/core';
import { Intercom } from '@capacitor-community/intercom';
import { DeploymentService } from './deployment.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class IntercomService {
  constructor(
    private sessionService: SessionService,
    private deploymentService: DeploymentService,
  ) {
    console.log(this.sessionService.getSiteConfigurations());
    console.log(this.deploymentService.getDeployment());
  }

  public registerUser(user: any) {
    const site = this.sessionService.getSiteConfigurations();
    const { domain } = this.deploymentService.getDeployment();

    const io = {
      userId: `${domain}_${user.userId}`,
      email: user.email,
      custom_launcher_selector: '#intercom_custom_launcher',
      created_at: user.created?.getDate(),
      deployment_url: domain,
      realname: user.realname,
      last_login: user.last_login,
      role: user.role,
      company: {
        company_id: String(site.id),
        name: String(site.name),
        id: domain,
        created_at: 0, // Faking this because we don't have this data
        plan: site.tier,
      },
    };
    console.log('Intercom options: ', io);
    Intercom.registerIdentifiedUser(io);
  }

  public displayLauncher() {
    Intercom.displayLauncher();
  }

  public hideLauncher() {
    Intercom.hideLauncher();
  }

  public displayMessenger() {
    Intercom.displayMessenger();
  }

  public hideMessenger() {
    Intercom.hideMessenger();
  }

  public logoutIntercom() {
    Intercom.logout();
  }
}
