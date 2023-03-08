import { Injectable } from '@angular/core';
import { CONST } from '@constants';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { LanguageInterface } from '@models';
import LangJSON from '../../../assets/locales/languages.json';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languages = new BehaviorSubject<LanguageInterface[]>(this.getLanguages());
  public languages$ = this.languages.asObservable();

  private languageKey = `${ CONST.LOCAL_STORAGE_PREFIX }language`;

  private selectedLanguage = new BehaviorSubject<string>('');
  public selectedLanguage$ = this.selectedLanguage.asObservable();
  private isRTL = new BehaviorSubject<boolean>(false);
  public isRTL$ = this.isRTL.asObservable();

  constructor(private translate: TranslateService) {
    if (this.initialLanguage === 'null' || this.initialLanguage === null) {
      this.initialLanguage = 'en';
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
          nplurals: 2
        }
      ];
    }
  }

  private setLanguage(lang: string) {
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    this.selectedLanguage.next(lang);
    this.changeDirection(lang);
  }

  public changeLanguage(value: string) {
    this.translate.use(value);
    localStorage.setItem(this.languageKey, value);
    this.selectedLanguage.next(value);
    this.changeDirection(value);
  }

  private changeDirection(value: string) {
    this.isRTL.next(!!this.languages.value.find((l) => l.code === value)?.rtl);
  }
}
