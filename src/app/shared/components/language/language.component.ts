import { Component, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { LanguageService } from '@services';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent {
  @Input() languages: any;
  @Input() selectedLanguage: any;

  constructor(private languageService: LanguageService) {}

  public changeLanguage(e: MatSelectChange) {
    this.languageService.changeLanguage(e.value);
  }
}
