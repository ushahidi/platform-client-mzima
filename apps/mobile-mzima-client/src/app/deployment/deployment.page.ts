import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deployment } from '@mzima-client/sdk';

import { AlertService, ConfigService, DeploymentService, EnvService } from '@services';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  public deploymentList: Deployment[] = [];

  constructor(
    private envService: EnvService,
    private configService: ConfigService,
    private deploymentService: DeploymentService,
    private router: Router,
    private alertService: AlertService,
  ) {}

  ionViewWillEnter() {
    this.loadDeployments();
  }

  private loadDeployments() {
    this.deploymentList = this.deploymentService.getDeployments();

    // For testing
    const index = this.deploymentList.findIndex((i: any) => i.deployment_name === 'mzima-api');
    if (index === -1) {
      this.deploymentList = [
        {
          id: 1,
          domain: 'staging.ush.zone',
          subdomain: 'mzima-api',
          fqdn: 'mzima.staging.ush.zone',
          status: 'deployed',
          deployment_name: 'mzima-api',
          description: 'mzima-api for testing',
          image: 'https://via.placeholder.com/150/B186D1/FFFFFF?text=M',
          tier: 'level_1',
          selected: false,
        },
        ...this.deploymentList,
      ];
      this.deploymentService.setDeployments(this.deploymentList);
    }
  }

  public async callModal(event: any) {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete this deployment?',
      message: 'Deleting means that from now you will not see it in your deployment list.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      const { deployment } = event;
      this.removeDeployment(deployment.id);
    }
  }

  public removeDeployment(deploymentId: number) {
    const index = this.deploymentList.findIndex((i: any) => i.id === deploymentId);
    if (index !== -1) this.deploymentList.splice(index, 1);
    this.deploymentService.setDeployments(this.deploymentList);
  }

  public selectDeployment(deployment: any) {
    this.deploymentService.setDeployment(deployment);
    this.envService.setDynamicBackendUrl();
    this.configService.initAllConfigurations();
    this.router.navigate(['/auth']);
  }
}
