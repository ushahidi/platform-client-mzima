import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, LanguageService } from '@services';
import { SelectLanguagesModalComponent } from '../select-languages-modal/select-languages-modal.component';

@Component({
  selector: 'app-translations-switch',
  templateUrl: './translations-switch.component.html',
  styleUrls: ['./translations-switch.component.scss'],
})
export class TranslationsSwitchComponent {
  @Output() chooseTranslationChange = new EventEmitter();
  @Output() deleteTranslationChange = new EventEmitter();
  @Output() addTranslationChange = new EventEmitter();
  public languages: LanguageInterface[] = this.languageService.getLanguages();
  public defaultLanguage?: LanguageInterface = this.languages.find((lang) => lang.code === 'en');
  public activeLanguages: LanguageInterface[] = [];
  public selectedTranslation?: string;

  constructor(
    private languageService: LanguageService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {}

  public chooseTranslation(languageCode?: string): void {
    this.selectedTranslation = languageCode;
    this.chooseTranslationChange.emit(languageCode);
  }

  public addTranslation(): void {
    const dialogRef = this.dialog.open(SelectLanguagesModalComponent, {
      width: '100%',
      maxWidth: 480,
      data: {
        languages: this.languages,
        activeLanguages: [this.defaultLanguage, ...this.activeLanguages],
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: string[]) => {
        if (!result) return;
        result.map((langCode) => {
          const language = this.languages.find((lang) => lang.code === langCode);
          if (this.activeLanguages.find((lang) => lang.code === langCode) || !language) return;
          this.activeLanguages.push(language);
          this.addTranslationChange.emit(langCode);
        });
      },
    });
  }

  public async deleteTranslation(event: Event, languageCode?: string): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.confirmModalService.open({
      title: 'Are you sure you want to remove this language and all the translations?',
      description: `<p>${this.translate.instant('notify.default.proceed_warning')}</p>`,
    });
    if (!confirmed) return;

    if (this.selectedTranslation === languageCode) {
      this.selectedTranslation = this.defaultLanguage?.code;
    }

    this.activeLanguages.splice(
      this.activeLanguages.findIndex((lang) => lang.code === languageCode),
      1,
    );

    this.deleteTranslationChange.emit(languageCode);
  }
}
