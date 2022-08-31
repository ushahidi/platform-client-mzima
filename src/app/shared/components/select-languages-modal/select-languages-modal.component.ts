import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Language } from '@models';

export interface SelectLanguagesDialogData {
  languages: Language[];
  activeLanguages: Language[];
}

@Component({
  selector: 'app-select-languages-modal',
  templateUrl: './select-languages-modal.component.html',
  styleUrls: ['./select-languages-modal.component.scss'],
})
export class SelectLanguagesModalComponent {
  public selectedLanguages: string[] = [];
  public errorLanguages: Language[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: SelectLanguagesDialogData) {}

  public checkLanguages(): void {
    this.errorLanguages = [];
    this.selectedLanguages.map((selectedLanguage) => {
      const lang = this.data.activeLanguages.find(
        (activeLanguage) => activeLanguage.code === selectedLanguage,
      );
      if (lang) {
        this.errorLanguages.push(lang);
      }
    });
  }

  public removeLanguagesWithErrors(): void {
    this.selectedLanguages = this.selectedLanguages.filter(
      (selectedLanguage) =>
        this.errorLanguages.findIndex(
          (errorLanguage) => errorLanguage.code === selectedLanguage,
        ) === -1,
    );
    this.checkLanguages();
  }
}
