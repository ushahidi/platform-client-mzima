import { Component, OnInit } from '@angular/core';
import { SurveyItem, SurveyItemEnabledLanguages } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from '@services';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  surveys: SurveyItem[];
  constructor(private surveysService: SurveysService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.surveysService.get().subscribe((res) => {
      this.surveys = res.results;
    });
  }

  duplicateSurvey(survey: SurveyItem) {
    // FIXME: probably we want to create here without redirects
    console.log('Survey: ', survey);
  }

  deleteSurvey(survey: SurveyItem) {
    // FIXME: Confirm + delete after we do creation.

    console.log('Survey: ', survey);
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
