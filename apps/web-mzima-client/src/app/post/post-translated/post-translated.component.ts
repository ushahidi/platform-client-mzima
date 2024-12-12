import { Component, EventEmitter, Output, Input } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-post-translated',
  templateUrl: './post-translated.component.html',
  styleUrls: ['./post-translated.component.scss'],
})
export class PostTranslatedComponent {
  @Output() public displayOriginalPost = new EventEmitter<Event>();
  @Output() public openTranslationModal = new EventEmitter<Event>();
  @Input() public baseLanguage: string;
  @Input() public displayLanguage: string;
  constructor(private languageService: LanguageService) {}

  public getLanguageName(code: string) {
    return this.languageService.getLanguages().find((lang) => lang.code === code)?.name || code;
  }

  originalPost() {
    this.displayOriginalPost.emit();
  }

  openTranslations() {
    this.openTranslationModal.emit();
  }
}
