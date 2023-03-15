import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { SelectLanguagesModalComponent } from '../select-languages-modal/select-languages-modal.component';
import { LanguageService } from '../../../core/services/language.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
  selector: 'app-translations-switch',
  templateUrl: './translations-switch.component.html',
  styleUrls: ['./translations-switch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TranslationsSwitchComponent implements OnInit {
  @Input() public selectedLanguages: string[] = [];
  @Output() private chooseTranslationChange = new EventEmitter();
  @Output() private deleteTranslationChange = new EventEmitter();
  @Output() private addTranslationChange = new EventEmitter();
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

  ngOnInit() {
    for (const langCode of this.selectedLanguages) {
      this.setActiveLanguages(langCode);
    }
  }

  public chooseTranslation(languageCode?: string): void {
    this.selectedTranslation = languageCode;
    this.chooseTranslationChange.emit(languageCode);
  }

  public addTranslation(): void {
    const dialogRef = this.dialog.open(SelectLanguagesModalComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: 'modal',
      data: {
        languages: this.languages,
        activeLanguages: [this.defaultLanguage, ...this.activeLanguages],
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: string[]) => {
        if (!result) return;
        result.map((langCode) => {
          this.setActiveLanguages(langCode);
          this.addTranslationChange.emit(langCode);
        });
      },
    });
  }

  private setActiveLanguages(langCode: string) {
    const language = this.languages.find((lang) => lang.code === langCode);
    if (this.activeLanguages.find((lang) => lang.code === langCode) || !language) return;
    this.activeLanguages.push(language);
  }

  public async deleteTranslation(event: Event, languageCode?: string): Promise<void> {
    event.stopPropagation();
    const language = this.languages.find((lang) => lang.code === languageCode);
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.do_you_really_want_to_delete_language', {
        lang: language!.name,
      }),
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
