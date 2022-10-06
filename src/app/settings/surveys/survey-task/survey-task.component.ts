import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FormAttributeInterface, RoleResult, SurveyItem, SurveyItemTask } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService } from '@services';
import { CreateFieldModalComponent } from '../create-field-modal/create-field-modal.component';

@Component({
  selector: 'app-survey-task',
  templateUrl: './survey-task.component.html',
  styleUrls: ['./survey-task.component.scss'],
})
export class SurveyTaskComponent implements OnInit {
  @Input() task: SurveyItemTask;
  @Input() survey: SurveyItem;
  @Input() roles: RoleResult[];

  surveyId: string;
  selectedRoles: any[] = [];

  taskFields: FormAttributeInterface[];
  isPost = false;

  constructor(
    private confirm: ConfirmModalService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id') || '';
    console.log('surveyId', this.surveyId);
    this.taskFields = this.task.fields;
    this.isPost = this.task.type === 'post';
  }

  drop(event: CdkDragDrop<FormAttributeInterface[]>) {
    moveItemInArray(this.taskFields, event.previousIndex, event.currentIndex);
  }

  async deleteField(index: number) {
    const confirmed = await this.confirm.open({
      title: this.translate.instant('notify.form.delete_attribute_confirm'),
      description: `<p>${this.translate.instant('notify.form.delete_attribute_confirm_desc')}</p>`,
    });
    if (!confirmed) return;

    this.taskFields.splice(index, 1);
  }

  get anonymiseReportersEnabled() {
    return true;
  }

  onCheckChange(event: any, field: any) {
    console.log('field', field, 'event', event);
    if (event.checked) {
      this.selectedRoles.push(field);
    } else {
      this.selectedRoles = this.selectedRoles.filter((r) => r !== field);
    }
  }

  addField() {
    const dialogRef = this.dialog.open(CreateFieldModalComponent, {
      width: '100%',
      maxWidth: '564px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response) {
          this.taskFields.push(response);
        }
      },
    });
  }
}
