import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class DeploymentGuard implements CanActivate {
  public isDesktop: boolean;

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isDeployment = this.storageService.getStorage('deployment');
    if (!isDeployment) {
      this.router.navigate(['/deployment']);
      return false;
    } else {
      return true;
    }
  }
}
