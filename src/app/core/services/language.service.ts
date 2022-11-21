import { Injectable } from '@angular/core';
import { CONST } from '@constants';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import LangJSON from '../../../assets/locales/languages.json';
import { LanguageInterface } from '@models';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private languages = new BehaviorSubject<LanguageInterface[]>(this.getLanguages());
  public languages$ = this.languages.asObservable();

  private languageKey = `${CONST.LOCAL_STORAGE_PREFIX}language`;

  private initialLanguage = localStorage.getItem(this.languageKey);
  private selectedLanguage = new BehaviorSubject<any>('');
  public selectedLanguage$ = this.selectedLanguage.asObservable();

  constructor(private translate: TranslateService) {
    if (this.initialLanguage === 'null' || this.initialLanguage === null) {
      this.initialLanguage = 'en';
      this.selectedLanguage.next('en');
      localStorage.setItem(this.languageKey, this.initialLanguage);
      this.setLanguage(this.initialLanguage);
    } else {
      this.setLanguage(this.initialLanguage);
    }
  }

  getLanguages(): LanguageInterface[] {
    if (LangJSON.languages && LangJSON.languages.length > 0) {
      return LangJSON.languages;
    } else {
      return [
        {
          rtl: false,
          pluralequation: 'language.pluralequation',
          code: 'en',
          name: 'English',
          nplurals: 2,
        },
      ];
    }
  }

  setLanguage(lang: string) {
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    this.selectedLanguage.next(lang);
  }

  changeLanguage(value: string) {
    this.translate.use(value);
    localStorage.setItem(this.languageKey, value);
    this.selectedLanguage.next(value);
  }
}
