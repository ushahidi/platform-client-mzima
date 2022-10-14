import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SurveyItem, SurveyItemEnabledLanguages } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, SurveysService } from '@services';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SurveysComponent implements OnInit {
  surveys: SurveyItem[];

  constructor(
    private surveysService: SurveysService,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.getSurveys();
  }

  private getSurveys() {
    this.surveysService.get().subscribe({
      next: (res) => (this.surveys = res.results),
    });
  }

  public duplicateSurvey(survey: SurveyItem) {
    const surveyDuplicate = JSON.parse(JSON.stringify(survey));
    delete surveyDuplicate.id;
    surveyDuplicate.name = `${survey.name} - duplicate`;

    this.surveysService.post(surveyDuplicate).subscribe({
      next: () => this.getSurveys(),
    });
  }

  async deleteSurvey({ id }: SurveyItem) {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.survey.destroy_confirm'),
      description: `<p>${this.translate.instant('notify.survey.destroy_confirm_desc')}</p>`,
    });
    if (!confirmed) return;

    this.surveysService.delete(id).subscribe({
      next: () => this.getSurveys(),
    });
  }

  getLanguages(languages: SurveyItemEnabledLanguages) {
    if (languages.available.length) {
      return `${this.translate.instant('translations.languages')}: ${this.translate.instant(
        'languages.' + languages.default,
      )}, ${languages.available.map((l) => this.translate.instant('languages.' + l)).join(', ')}`;
    } else {
      return `${this.translate.instant('translations.language')}: ${this.translate.instant(
        `languages.${languages.default}`,
      )}`;
    }
  }
}
