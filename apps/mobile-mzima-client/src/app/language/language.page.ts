import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { STORAGE_KEYS } from '@constants';
import { LanguageInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DeploymentService, LanguageService, StorageService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-language-page',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
})
export class LanguagePage {
  public languages: LanguageInterface[] = this.languageService.getLanguages();
  public selectedLanguage = 'en';

  constructor(
    private router: Router,
    private deploymentService: DeploymentService,
    private languageService: LanguageService,
    private storageService: StorageService,
  ) {
    this.languageService.selectedLanguage$.pipe(untilDestroyed(this)).subscribe((language) => {
      this.selectedLanguage = language;
    });
  }

  public selectLanguage(languageCode: string): void {
    this.languageService.changeLanguage(languageCode);
  }

  public continue(): void {
    if (!this.storageService.getStorage(STORAGE_KEYS.INTRO_DONE)) {
      this.router.navigate(['/walkthrough']);
      return;
    }

    this.deploymentService.isDeployment()
      ? this.router.navigate(['/'])
      : this.router.navigate(['/deployment']);
  }
}
