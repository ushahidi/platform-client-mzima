import { HttpClient } from '@angular/common/http';
import { CONST } from '@constants';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, map, catchError } from 'rxjs';

export class CustomTranslateHttpLoader implements TranslateLoader {
  private languageKey = `${CONST.LOCAL_STORAGE_PREFIX}language`;

  constructor(
    private http: HttpClient,
    public prefix: string = './assets/locales/',
    public suffix: string = '.json',
  ) {}

  /**
   * Gets the translations from the server
   */
  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`).pipe(
      map((res) => {
        localStorage.setItem(this.languageKey, lang);
        return res;
      }),
      catchError(() => {
        const langArray = lang.split('-');
        if (langArray.length > 1) {
          return this.getTranslation(langArray[0]);
        } else {
          return this.getTranslation('en');
        }
      }),
    );
  }
}
