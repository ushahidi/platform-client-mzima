import { Injectable } from '@angular/core';
import { generalHelpers } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { LanguageInterface } from '@mzima-client/sdk';
import LangJSON from '../../../assets/locales/languages.json';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private languages = new BehaviorSubject<LanguageInterface[]>(this.getLanguages());
  public languages$ = this.languages.asObservable();
  private languageKey = `${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}language`;
  private selectedLanguage = new BehaviorSubject<string>('');
  public selectedLanguage$ = this.selectedLanguage.asObservable();

  constructor(private translate: TranslateService, private session: SessionService) {
    this.translate.setDefaultLang('en');
    if (
      this.initialLanguage === 'null' ||
      this.initialLanguage === null ||
      !this.languages.value.find((language) => language.code === this.initialLanguage)
    ) {
      this.initialLanguage = this.session.getSiteConfigurations().language || 'en';
      this.setLanguage(this.initialLanguage!);
    } else {
      this.setLanguage(this.initialLanguage!);
    }
  }

  public get initialLanguage() {
    return localStorage.getItem(this.languageKey)!;
  }

  private set initialLanguage(value: string) {
    localStorage.setItem(this.languageKey, value);
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
  public changeLanguage(value: string) {
    this.translate.use(value);
    localStorage.setItem(this.languageKey, value);
    this.selectedLanguage.next(value);
  }

  private setLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLanguage.next(lang);
  }
}
