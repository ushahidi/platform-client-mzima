import { Injectable } from '@angular/core';
import { Intercom } from '@capacitor-community/intercom';
import { DeploymentService } from './deployment.service';
import { SessionService } from './session.service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class IntercomService {
  constructor(
    private sessionService: SessionService,
    private deploymentService: DeploymentService,
    private platform: Platform,
  ) {
    console.log(this.sessionService.getSiteConfigurations());
    console.log(this.deploymentService.getDeployment());
  }

  public registerUser(user: any) {
    if (!this.platform.is('capacitor')) return;
    const site = this.sessionService.getSiteConfigurations();
    const deployment = this.deploymentService.getDeployment();
    if (deployment) {
      const { domain } = deployment;

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
  }

  public displayLauncher() {
    if (!this.platform.is('capacitor')) return;
    Intercom.displayLauncher();
  }

  public hideLauncher() {
    if (!this.platform.is('capacitor')) return;
    Intercom.hideLauncher();
  }

  public displayMessenger() {
    if (!this.platform.is('capacitor')) return;
    Intercom.displayMessenger();
  }

  public hideMessenger() {
    if (!this.platform.is('capacitor')) return;
    Intercom.hideMessenger();
  }

  public logoutIntercom() {
    if (!this.platform.is('capacitor')) return;
    Intercom.logout();
  }
}
