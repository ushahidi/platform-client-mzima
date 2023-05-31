import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, DeploymentService, StorageService } from '@services';
import { STORAGE_KEYS } from '../core/constants/storage-key';

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
    private storageService: StorageService,
  ) {}

  public logout(): void {
    this.authService.logout();
    this.deploymentService.removeDeployment();
    this.router.navigate(['/deployment']);
  }

  public resetOnboarding(): void {
    this.storageService.deleteStorage(STORAGE_KEYS.INTRO_DONE);
    this.authService.logout();
    this.deploymentService.removeDeployment();
    this.router.navigate(['/walkthrough']);
  }
}
