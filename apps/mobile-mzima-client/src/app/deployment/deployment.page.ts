import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { ConfigService, DeploymentService, EnvService } from '@services';
import { DeleteDeploymentModalComponent } from './components/delete-deployment-modal/delete-deployment-modal.component';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  public deploymentList: any[] = [];

  constructor(
    private modalController: ModalController,
    private envService: EnvService,
    private configService: ConfigService,
    private deploymentService: DeploymentService,
    private router: Router,
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
          fqdn: 'mzima-api',
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
    const { deployment } = event;
    const modal = await this.modalController.create({
      component: DeleteDeploymentModalComponent,
      id: 'delete-deployment',
      cssClass: 'delete-deployment',
      componentProps: {
        deploymentId: deployment.id,
      },
    });

    modal.onDidDismiss().then((data: any) => {
      const { data: deploymentId, role: status } = data;
      if (status === 'success') {
        this.removeDeployment(deploymentId);
      }
    });

    return await modal.present();
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
    this.router.navigate(['/']);
  }
}
