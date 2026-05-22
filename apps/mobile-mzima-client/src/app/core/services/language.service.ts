import { Injectable } from '@angular/core';
import { CONST } from '@constants';
import { LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { EnvService } from './env.service';
import LangJSON from '../../../assets/locales/languages.json';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly languageKey = `${CONST.LOCAL_STORAGE_PREFIX}language`;
  private readonly languages = new BehaviorSubject<LanguageInterface[]>(
    this.getConfiguredLanguages(),
  );
  public readonly languages$ = this.languages.asObservable();
  private readonly selectedLanguage = new BehaviorSubject<string>('en');
  public readonly selectedLanguage$ = this.selectedLanguage.asObservable();
  private readonly isRTL = new BehaviorSubject<boolean>(false);
  public readonly isRTL$ = this.isRTL.asObservable();

  constructor(private translate: TranslateService, private envService: EnvService) {
    this.translate.setDefaultLang('en');
    this.setLanguage(this.initialLanguage);
  }

  public getLanguages(): LanguageInterface[] {
    return this.languages.value;
  }

  public changeLanguage(languageCode: string): void {
    localStorage.setItem(this.languageKey, languageCode);
    this.setLanguage(languageCode);
  }

  public hasSelectedLanguage(): boolean {
    const storedLanguage = localStorage.getItem(this.languageKey);
    if (!storedLanguage) return false;

    return this.resolveSupportedLanguage(storedLanguage) === storedLanguage;
  }

  private get initialLanguage(): string {
    const storedLanguage = localStorage.getItem(this.languageKey);
    if (storedLanguage) return this.resolveSupportedLanguage(storedLanguage);

    const configuredLanguage = this.envService.environment?.default_locale;
    if (configuredLanguage) return this.resolveSupportedLanguage(configuredLanguage);

    return this.resolveSupportedLanguage(navigator.language || 'en');
  }

  private setLanguage(languageCode: string): void {
    const supportedLanguage = this.resolveSupportedLanguage(languageCode);
    this.translate.use(supportedLanguage);
    this.selectedLanguage.next(supportedLanguage);
    this.isRTL.next(
      !!this.languages.value.find((language) => language.code === supportedLanguage)?.rtl,
    );
  }

  private getConfiguredLanguages(): LanguageInterface[] {
    return LangJSON.languages?.length
      ? LangJSON.languages
      : [
          {
            code: 'en',
            name: 'English',
            rtl: false,
            nplurals: 2,
            pluralequation: 'n != 1',
          },
        ];
  }

  private resolveSupportedLanguage(locale: string): string {
    const normalizedLocale = locale.replace('_', '-');
    const exactLanguage = this.languages.value.find(
      (language) => language.code.toLowerCase() === normalizedLocale.toLowerCase(),
    );
    if (exactLanguage) return exactLanguage.code;

    const baseLanguageCode = normalizedLocale.split('-')[0].toLowerCase();
    const baseLanguage = this.languages.value.find(
      (language) => language.code.split('-')[0].toLowerCase() === baseLanguageCode,
    );
    return baseLanguage?.code || 'en';
  }
}
