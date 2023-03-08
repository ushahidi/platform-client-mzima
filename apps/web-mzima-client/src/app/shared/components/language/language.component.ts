import { Component, Input } from '@angular/core';
import { MAT_SELECT_CONFIG, MatSelectChange } from '@angular/material/select';
import {LanguageService} from "../../../core/services/language.service";
// import { LanguageService } from '@services';

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
export class LanguageComponent {
  @Input() languages: any;
  @Input() selectedLanguage: any;

  constructor(private languageService: LanguageService) {}

  public changeLanguage(e: MatSelectChange) {
    this.languageService.changeLanguage(e.value);
  }
}
