import { Component } from '@angular/core';
import { StorageService } from '@services';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  public deploymentList: any[] = [];

  constructor(private storageService: StorageService) {}

  ionViewWillEnter() {
    this.loadData();
  }

  private loadData() {
    this.deploymentList = this.storageService.getStorage('deployments', 'array') || [];
  }

  public removeDeployment(event: any) {
    const { deployment } = event;
    const index = this.deploymentList.findIndex((i: any) => i.id === deployment.id);
    if (index !== -1) this.deploymentList.splice(index, 1);
    this.storageService.setStorage('deployments', this.deploymentList, 'array');
  }
}
