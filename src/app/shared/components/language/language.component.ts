import { Component, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { CONST } from '@constants';
import { LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@services';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageComponent {
  private languageKey = `${CONST.LOCAL_STORAGE_PREFIX}language`;
  public languages: LanguageInterface[] = this.languageService.getLanguages();
  public selectedLanguage = localStorage.getItem(this.languageKey);

  constructor(
    private translate: TranslateService, //
    private languageService: LanguageService,
  ) {
    if (this.selectedLanguage === 'null' || this.selectedLanguage === null) {
      this.selectedLanguage = 'en';
      localStorage.setItem(this.languageKey, this.selectedLanguage);
      this.setLanguage(this.selectedLanguage);
    } else {
      this.setLanguage(this.selectedLanguage);
    }
  }

  setLanguage(lang: string) {
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  changeLanguage(e: MatSelectChange) {
    this.translate.use(e.value);
    localStorage.setItem(this.languageKey, e.value);
  }
}
