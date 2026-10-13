import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { LanguageService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class LanguageGuard implements CanActivate {
  constructor(private router: Router, private languageService: LanguageService) {}

  canActivate(): boolean {
    if (this.languageService.hasSelectedLanguage()) {
      return true;
    }

    this.router.navigate(['/language']);
    return false;
  }
}
