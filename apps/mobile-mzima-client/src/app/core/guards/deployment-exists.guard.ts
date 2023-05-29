import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { DeploymentService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class DeploymentExistsGuard implements CanActivate {
  public isDesktop: boolean;

  constructor(private router: Router, private deploymentService: DeploymentService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isDeployment = this.deploymentService.isDeployment();
    if (isDeployment) {
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }
}
