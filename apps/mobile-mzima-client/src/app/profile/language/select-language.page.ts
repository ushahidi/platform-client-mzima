import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@services';
import { LanguageInterface } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-language',
  templateUrl: 'select-language.page.html',
  styleUrls: ['select-language.page.scss'],
})
export class SelectLanguagePage {
  public languages: LanguageInterface[];
  public selectedLanguage: any;
  public initialLanguage: any;

  constructor(
    private languageService: LanguageService,
    public translate: TranslateService,
    private router: Router,
  ) {
    this.languages = this.languageService.getLanguages();
    this.selectedLanguage = this.languageService.initialLanguage;
  }

  public selectLanguage(language: string) {
    this.selectedLanguage = language;
    console.log(language);
    this.languageService.changeLanguage(language);
  }

  public getSelectedLanguage() {
    const initial = this.languageService.initialLanguage;
    this.selectedLanguage = this.languages.find((language) => {
      console.log(language);
      return language.code === initial;
    });
  }

  public back(): void {
    this.router.navigate(['profile']);
  }
}
