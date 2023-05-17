import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from '@services';
import { DeleteDeploymentModalComponent } from './components/delete-deployment-modal/delete-deployment-modal.component';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  public deploymentList: any[] = [];

  constructor(private storageService: StorageService, private modalController: ModalController) {}

  ionViewWillEnter() {
    this.loadData();
  }

  private loadData() {
    this.deploymentList = this.storageService.getStorage('deployments', 'array') || [];
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
    this.storageService.setStorage('deployments', this.deploymentList, 'array');
  }
}
