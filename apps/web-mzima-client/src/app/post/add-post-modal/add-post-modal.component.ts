import { Component, OnInit } from '@angular/core';
import { SurveysService, generalHelpers } from '@mzima-client/sdk';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-add-post-modal',
  templateUrl: './add-post-modal.component.html',
  styleUrls: ['./add-post-modal.component.scss'],
})
export class AddPostModalComponent implements OnInit {
  public surveys: Observable<any>;

  constructor(private surveysService: SurveysService) {}
  ngOnInit() {
    this.getSurveys();
  }

  private getSurveys(): void {
    this.surveysService
      .getSurveys('', { only: 'name,color,everyone_can_create,can_create' })
      .subscribe(({ results }) => {
        let surveys = this.mapVisibility(results);
        surveys = surveys.filter((survey: any) => survey.visible === true);
        this.surveys = of(surveys);
      });
  }

  private mapVisibility(surveys: any) {
    return surveys.map((el: any) => {
      el.visible =
        el.everyone_can_create ||
        el.can_create.includes(
          localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`),
        );
      return el;
    });
  }
}
