import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormAttributeInterface, SurveyItemTask } from '@models';
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

  taskFields: FormAttributeInterface[];
  isPost = false;

  constructor(
    private confirm: ConfirmModalService,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
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

  addField() {
    const dialogRef = this.dialog.open(CreateFieldModalComponent, {
      width: '100%',
      maxWidth: '564px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        console.log('response, ', response);
        if (response) {
          // this.survey.tasks.push(response);
        }
      },
    });
  }
}
