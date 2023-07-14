import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, DatabaseService, DeploymentService, StorageService } from '@services';
import { STORAGE_KEYS } from '@constants';

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
    private dataBaseService: DatabaseService,
  ) {}

  public logout(): void {
    this.authService.logout();
    this.deploymentService.removeDeployment();
    this.router.navigate(['/deployment']);
  }

  public async clearPosts() {
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, []);
    this.router.navigate(['/']);
  }

  public resetAppData(): void {
    localStorage.clear();
    this.authService.logout();
    this.dataBaseService.clear();
    this.router.navigate(['/walkthrough']);
  }
}
