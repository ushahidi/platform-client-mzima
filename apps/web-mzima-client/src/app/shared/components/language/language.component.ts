import { Component, Input, OnInit } from '@angular/core';
import { MAT_SELECT_CONFIG, MatSelectChange } from '@angular/material/select';
import { LanguageService } from '@services';
import * as locale from 'locale-codes';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'language-list' },
    },
  ],
})
export class LanguageComponent implements OnInit {
  @Input() languages: any;
  @Input() selectedLanguage: any;

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    if (!this.checkLanguage(this.selectedLanguage)) {
      const newLanguage: any = locale.where('tag', this.selectedLanguage)['iso639-1'];
      this.selectedLanguage = this.checkLanguage(newLanguage) ? newLanguage : 'en';
    }
  }

  private checkLanguage(lang: any) {
    return this.languages.find((language: any) => language.code === lang);
  }

  public changeLanguage(e: MatSelectChange) {
    this.languageService.changeLanguage(e.value);
  }
}
