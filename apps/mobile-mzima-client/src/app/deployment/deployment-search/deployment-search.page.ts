import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { DeploymentService } from '@services';
import { FormControlComponent } from '../../shared/components/form-control/form-control.component';
import { Deployment } from '@mzima-client/sdk';

@Component({
  selector: 'app-deployment-search',
  templateUrl: './deployment-search.page.html',
  styleUrls: ['./deployment-search.page.scss'],
})
export class DeploymentSearchPage implements AfterViewInit {
  @ViewChild('searchControl') public searchControl: FormControlComponent;
  public deploymentList: any[] = [];
  public loading = false;
  public addButtonVisible = false;
  private search: string | null = '';
  private domain: string | null = null;
  private selectedDeployments: Deployment[] = [];

  constructor(private location: Location, private deploymentService: DeploymentService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchControl.setFocus();
    }, 1000);
  }

  ionViewWillEnter() {
    this.getDeployments();
  }

  private getDeployments() {
    const storeDeployments = this.deploymentService.getDeployments();
    if (storeDeployments.length) {
      this.selectedDeployments = storeDeployments;
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
        next: (deployments: any[]) => {
          this.loading = false;
          this.deploymentList = deployments;
        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
      });
    } else {
      this.loading = false;
      this.deploymentList = [];
    }
  }

  public selectDeployment(event: any) {
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
    this.addButtonVisible = !!this.selectedDeployments.length;
  }

  public addDeployment() {
    this.deploymentService.setDeployments(this.selectedDeployments);
    this.onBack();
  }
}
