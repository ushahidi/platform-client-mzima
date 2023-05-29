import { Component } from '@angular/core';
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
  ) {}

  ionViewWillEnter() {
    this.loadDeployments();
  }

  private loadDeployments() {
    this.deploymentList = this.deploymentService.getDeployments();
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
    // this.envService.setDynamicBackendUrl(`${ subdomain }.${ domain }`);
    // this.configService.initAllConfigurations();
    this.deploymentService.setDeployment(deployment);
  }
}
