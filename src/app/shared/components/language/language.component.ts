import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { CONST } from '@constants';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@services';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageComponent implements OnInit {
  public languages = this.languageService.getLanguages();
  public selectedLanguage = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}language`);

  constructor(
    private translate: TranslateService, //
    private languageService: LanguageService,
  ) {
    if (this.selectedLanguage === 'null' || this.selectedLanguage === null) {
      this.selectedLanguage = 'en';
      localStorage.setItem(`${CONST.LOCAL_STORAGE_PREFIX}language`, this.selectedLanguage);
      translate.setDefaultLang(this.selectedLanguage);
      translate.use(this.selectedLanguage);
    } else {
      translate.setDefaultLang(this.selectedLanguage);
      translate.use(this.selectedLanguage);
    }
  }

  ngOnInit() {
    console.log(this.languageService.getLanguages());
  }

  changeLanguage(e: MatSelectChange) {
    this.translate.use(e.value);
    localStorage.setItem(`${CONST.LOCAL_STORAGE_PREFIX}language`, e.value);
  }
}
