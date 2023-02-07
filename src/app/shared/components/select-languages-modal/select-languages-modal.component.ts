import { Component, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageInterface } from '@models';
import { BreakpointService } from '@services';

export interface SelectLanguagesDialogData {
  defaultLanguage: LanguageInterface;
  languages: LanguageInterface[];
  activeLanguages: LanguageInterface[];
}

@Component({
  selector: 'app-select-languages-modal',
  templateUrl: './select-languages-modal.component.html',
  styleUrls: ['./select-languages-modal.component.scss'],
})
export class SelectLanguagesModalComponent implements OnInit {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public languages: LanguageInterface[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SelectLanguagesDialogData,
    private breakpointService: BreakpointService,
  ) {}

  ngOnInit() {
    this.languages = this.data.languages;
  }

  searchLanguage(event: any) {
    if (!event.target.value) {
      this.languages = this.data.languages;
    }
    this.languages = this.data.languages.filter((el) => {
      return el.name.toLowerCase().match(event.target.value);
    });
  }

  async selectLanguage(event: MatCheckboxChange, lang: LanguageInterface) {
    if (event.checked) {
      this.data.activeLanguages.push(lang);
    } else {
      const index = this.data.activeLanguages.indexOf(lang);
      this.data.activeLanguages.splice(index, 1);
    }
  }
}
