import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService } from '@services';
import { catchError, forkJoin, map, Observable, of, take } from 'rxjs';
import { SurveysService } from '../../core/services/surveys.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  public surveys: SurveyItem[];
  public selectedSurveys: SurveyItem[] = [];
  public isShowActions = false;

  constructor(
    private readonly surveysService: SurveysService,
    private readonly translate: TranslateService,
    private readonly confirmModalService: ConfirmModalService,
    private readonly breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  ngOnInit(): void {
    this.getSurveys();
  }

  private getSurveys(): void {
    this.surveysService
      .getSurveys()
      .pipe(
        map((res) => res.results),
        catchError((err) => {
          console.error(err);
          return of([]);
        }),
      )
      .subscribe((surveys) => {
        this.surveys = surveys;
      });
  }

  public duplicateSurvey() {
    if (this.selectedSurveys.length > 1 || !this.selectedSurveys.length) return;
    const survey: SurveyItem = this.selectedSurveys.shift()!;
    const surveyDuplicate = { ...survey, id: null, name: `${survey.name} - duplicate` };

    this.surveysService.post(surveyDuplicate).subscribe({
      next: () => this.getSurveys(),
      error: (err) => console.log(err),
    });
  }

  async deleteSurvey() {
    const confirmed = await this.confirmModalService.open({
      title:
        this.selectedSurveys.length > 1
          ? 'Are you sure you want to delete selected surveys?'
          : this.translate.instant('notify.survey.destroy_confirm'),
      description: `
        <p>${
          this.selectedSurveys.length > 1
            ? 'Deleting these surveys will remove it from database. This action cannot be undone.'
            : this.translate.instant('notify.survey.destroy_confirm_desc')
        }</p>
      `,

      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    const join = [];
    for (const survey of this.selectedSurveys) {
      join.push(this.surveysService.deleteSurvey(survey.id));
    }
    forkJoin(join)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.getSurveys();
          this.selectedSurveys = [];
        },
        error: (e) => console.log(e),
      });
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
}
