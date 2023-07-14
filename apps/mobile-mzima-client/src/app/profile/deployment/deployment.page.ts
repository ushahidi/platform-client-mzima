import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Deployment } from '@mzima-client/sdk';
import { ChooseDeploymentComponent } from '../../shared/components';

@Component({
  selector: 'app-deployment',
  templateUrl: 'deployment.page.html',
  styleUrls: ['deployment.page.scss'],
})
export class DeploymentPage {
  @ViewChild('chooseDeployment') public chooseDeployment: ChooseDeploymentComponent;
  public deploymentList: Deployment[] = [];

  constructor(private router: Router) {}

  public back(): void {
    this.router.navigate(['profile']);
  }

  ionViewWillEnter(): void {
    this.chooseDeployment.loadDeployments();
  }

  public deploymentChosen(): void {
    this.router.navigate(['profile']);
  }
}
