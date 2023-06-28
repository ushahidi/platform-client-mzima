import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deployment } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DeploymentService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-deployment-info',
  templateUrl: './deployment-info.component.html',
  styleUrls: ['./deployment-info.component.scss'],
})
export class DeploymentInfoComponent {
  public deployment: Deployment | null;
  constructor(private deploymentService: DeploymentService, private router: Router) {
    this.deploymentService.deployment$.pipe(untilDestroyed(this)).subscribe({
      next: (deployment) => {
        this.deployment = deployment;
      },
    });
  }

  public chooseDeployment(): void {
    this.deploymentService.removeDeployment();
    this.router.navigate(['deployment']);
  }
}
