import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class WalkthroughGuard implements CanActivate {
  public isDesktop: boolean;

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isWalkthrough = this.storageService.getStorage('isIntroDone');
    if (!isWalkthrough) {
      this.router.navigate(['/walkthrough']);
      return false;
    } else {
      return true;
    }
  }
}
