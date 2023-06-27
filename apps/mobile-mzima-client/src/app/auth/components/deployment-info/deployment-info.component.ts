import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DeploymentService } from '@services';

@Component({
  selector: 'app-deployment-info',
  templateUrl: './deployment-info.component.html',
  styleUrls: ['./deployment-info.component.scss'],
})
export class DeploymentInfoComponent {
  public deployment: any;
  constructor(private deploymentService: DeploymentService, private router: Router) {
    this.deployment = this.deploymentService.getDeployment();
  }

  public chooseDeployment(): void {
    this.deploymentService.removeDeployment();
    this.router.navigate(['deployment']);
  }
}
