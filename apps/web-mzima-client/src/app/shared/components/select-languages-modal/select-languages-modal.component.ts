import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageInterface } from '@models';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService } from '@services';

export interface SelectLanguagesDialogData {
  defaultLanguage?: LanguageInterface;
  languages: LanguageInterface[];
  activeLanguages: LanguageInterface[];
}

@UntilDestroy()
@Component({
  selector: 'app-select-languages-modal',
  templateUrl: './select-languages-modal.component.html',
  styleUrls: ['./select-languages-modal.component.scss'],
})
export class SelectLanguagesModalComponent implements OnInit {
  public isDesktop$: Observable<boolean>;

  public languages: LanguageInterface[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SelectLanguagesDialogData,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

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

  async selectLanguage(event: any, lang: LanguageInterface) {
    const index = this.data.activeLanguages.indexOf(lang);
    if (index < 0) {
      this.data.activeLanguages.push(lang);
    } else {
      this.data.activeLanguages.splice(index, 1);
    }
  }
}
