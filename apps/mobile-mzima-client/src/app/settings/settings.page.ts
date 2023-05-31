import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, DeploymentService } from '@services';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage {
  public mode: number | 'fullscreen';

  constructor(
    private router: Router,
    private authService: AuthService,
    private deploymentService: DeploymentService,
  ) {}

  public logout(): void {
    this.authService.logout();
    this.deploymentService.removeDeployment();
    this.router.navigate(['/deployment']);
  }
}
