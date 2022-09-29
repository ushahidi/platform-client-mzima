import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SurveyItem } from '@models';
import { SurveysService } from '@services';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
})
export class CreateSurveyComponent implements OnInit {
  survey: SurveyItem;
  constructor(
    private surveysService: SurveysService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.surveysService.getById(18).subscribe((res) => {
      console.log('res', res);
      this.survey = res.result;
    });
    this.route.queryParamMap.subscribe((queryParams) => {
      console.log('surveysService', queryParams);
      const id = queryParams.get('id');
      if (id) {
        this.surveysService.getById(id).subscribe((res) => {
          console.log('res', res);
          this.survey = res;
        });
      }
    });
    console.log('CreateSurveyComponent');
  }

  addTask() {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      width: '100%',
      maxWidth: '564px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        console.log('response, ', response);
        if (response) {
          this.survey.tasks.push(response);
        }
      },
    });
  }
}
