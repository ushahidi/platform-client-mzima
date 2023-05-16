import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { StorageService } from '@services';
import { DeploymentService } from '../../core/services/deployment.service';

@Component({
  selector: 'app-deployment-search',
  templateUrl: './deployment-search.page.html',
  styleUrls: ['./deployment-search.page.scss'],
})
export class DeploymentSearchPage {
  public deploymentList: any[] = [];
  public loading = false;
  private search: string | null = '';
  private domain: string | null = null;
  private selectedDeployments: any[] = [];

  constructor(
    private location: Location,
    private deploymentService: DeploymentService,
    private storageService: StorageService,
  ) {
    const storeDeployments = storageService.getStorage('deployments');
    if (storeDeployments) {
      this.selectedDeployments = JSON.parse(storeDeployments);
    }
  }

  public onBack() {
    this.location.back();
  }

  public searchDeployments(event: any) {
    // this.logger.info(this, "searchDeployments", event.target.value);
    this.search = event.target.value;
    if (this.search == null) {
      this.loading = false;
      this.deploymentList = [];
      this.domain = null;
    } else if (
      this.search.indexOf('.') != -1 ||
      this.search.indexOf('http:') != -1 ||
      this.search.indexOf('https:') != -1
    ) {
      this.loading = false;
      this.deploymentList = [];
      this.domain = this.search.toLowerCase().replace('http://', '').replace('https://', '');
    } else if (this.search.length > 0) {
      this.loading = true;
      this.domain = null;
      this.deploymentService.searchDeployments(this.search).subscribe({
        next: (deployments) => {
          this.loading = false;
          console.log(deployments);
          this.deploymentList = deployments;
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
        },
      });
    } else {
      this.loading = false;
      this.deploymentList = [];
    }
  }

  public addDeployment(event: any) {
    const { checked, deployment } = event;
    if (checked) {
      if (this.selectedDeployments.some((i: any) => i.id === deployment.id)) {
        return;
      }
      this.selectedDeployments.push(deployment);
    } else {
      const index = this.selectedDeployments.findIndex((i: any) => i.id === deployment.id);
      if (index !== -1) {
        this.selectedDeployments.splice(index, 1);
      }
    }
    this.storageService.setStorage('deployments', this.selectedDeployments, 'array');
  }
}
