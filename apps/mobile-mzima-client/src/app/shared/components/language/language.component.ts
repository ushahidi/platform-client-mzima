import { Component, Input } from '@angular/core';
import { LanguageInterface } from '@models';
import { LanguageService } from '@services';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent {
  @Input() public languages: LanguageInterface[] = [];
  @Input() public selectedLanguage: string | null = 'en';

  public isOpen = false;

  constructor(private languageService: LanguageService) {}

  public openLanguageList(event: Event): void {
    event.stopPropagation();
    this.isOpen = true;
  }

  public changeLanguage(languageCode: string): void {
    this.languageService.changeLanguage(languageCode);
    this.isOpen = false;
  }
}
