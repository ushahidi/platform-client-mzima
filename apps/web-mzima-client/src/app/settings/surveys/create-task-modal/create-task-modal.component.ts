import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
})
export class CreateTaskModalComponent {
  public newTask: any = {
    label: '',
    description: '',
    required: false,
    fields: [],
    type: 'task',
    show_when_published: false,
    task_is_internal_only: true,
  };

  constructor(private matDialogRef: MatDialogRef<CreateTaskModalComponent>) {}

  cancel() {
    this.matDialogRef.close();
  }

  addNewTask() {
    this.matDialogRef.close({
      ...this.newTask,
      label: this.newTask.label.trim(),
      description: this.newTask.description.trim(),
    });
  }
}
