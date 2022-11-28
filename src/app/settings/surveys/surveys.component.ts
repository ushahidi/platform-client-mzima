import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { SurveyItem, SurveyItemEnabledLanguages } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, SurveysService } from '@services';
import { forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  public surveys: SurveyItem[];
  public selectedSurveys: SurveyItem[] = [];
  public isShowActions = false;

  constructor(
    private surveysService: SurveysService,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getSurveys();
  }

  private getSurveys() {
    this.surveysService.get().subscribe({
      next: (res) => (this.surveys = res.results),
      error: (err) => console.log(err),
    });
  }

  public duplicateSurvey() {
    if (this.selectedSurveys.length > 1 || !this.selectedSurveys.length) return;
    const survey: SurveyItem = this.selectedSurveys.shift()!;
    const surveyDuplicate = JSON.parse(JSON.stringify(survey));
    delete surveyDuplicate.id;
    surveyDuplicate.name = `${survey.name} - duplicate`;

    this.surveysService.post(surveyDuplicate).subscribe({
      next: () => this.getSurveys(),
      error: (err) => console.log(err),
    });
  }

  async deleteSurvey() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.survey.destroy_confirm', {
        count: this.selectedSurveys.length,
      }),
      description: `<p>${this.translate.instant('notify.survey.destroy_confirm_desc')}</p>`,

      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    const join = [];
    for (const survey of this.selectedSurveys) {
      join.push(this.surveysService.delete(survey.id));
    }
    forkJoin(join)
      .pipe(take(1))
      .subscribe({
        next: () => this.getSurveys(),
        error: (e) => console.log(e),
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

  public selectSurveys({ checked }: MatCheckboxChange, survey: SurveyItem) {
    if (checked) {
      this.selectedSurveys.push(survey);
    } else {
      const index = this.selectedSurveys.findIndex((el: any) => el.id === survey.id);
      if (index > -1) this.selectedSurveys.splice(index, 1);
    }
  }

  public showActions(event: boolean) {
    this.isShowActions = event;
  }

  public createSurvey() {
    this.router.navigate(['settings/surveys/create']);
  }
}
