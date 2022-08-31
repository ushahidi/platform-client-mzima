import { Injectable } from '@angular/core';
import LangJSON from '../../../assets/locales/languages.json';
import { Language } from '@models';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  getLanguages(): Language[] {
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
}
