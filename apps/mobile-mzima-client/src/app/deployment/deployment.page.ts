import { Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Deployment } from '@mzima-client/sdk';
import { ChooseDeploymentComponent } from '../shared/components/choose-deployment/choose-deployment.component';
import { SessionService } from '@services';
import { take } from 'rxjs';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  @ViewChild('chooseDeployment') public chooseDeployment: ChooseDeploymentComponent;
  public deploymentList: Deployment[] = [];

  constructor(
    private location: Location,
    private router: Router,
    private sessionService: SessionService,
  ) {}

  public backHandle(): void {
    console.log('back');
    this.location.back();
    this.router.navigate(['profile']);
    this.chooseDeployment.layout.closeSearchForm();
    return;
  }

  ionViewWillEnter(): void {
    this.chooseDeployment.loadDeployments();
  }

  public deploymentChosen(): void {
    this.sessionService.siteConfig$.pipe(take(1)).subscribe({
      next: (config) => {
        if (config.private) {
          this.router.navigate(['auth/login']);
        } else {
          this.router.navigate(['profile']);
        }
      },
    });
  }
}
