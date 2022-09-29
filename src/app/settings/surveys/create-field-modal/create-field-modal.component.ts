import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { surveyHelper } from '@helpers';
import { FormAttributeInterface } from '@models';

@Component({
  selector: 'app-create-field-modal',
  templateUrl: './create-field-modal.component.html',
  styleUrls: ['./create-field-modal.component.scss'],
})
export class CreateFieldModalComponent {
  public fields = surveyHelper.surveyFields;
  selectedFieldType: any;
  editMode = true;
  label: any;
  availableCategories: any;

  constructor(private matDialogRef: MatDialogRef<CreateFieldModalComponent>) {}

  cancel() {
    this.matDialogRef.close();
  }

  get onlyOptional() {
    return (
      this.selectedFieldType.input !== 'tags' &&
      this.selectedFieldType.type !== 'description' &&
      this.selectedFieldType.type !== 'title'
    );
  }

  get canMakePrivate() {
    return (
      this.selectedFieldType.type !== 'tags' &&
      this.selectedFieldType.type !== 'title' &&
      this.selectedFieldType.type !== 'description'
    );
  }

  get canDisableCaption() {
    return this.selectedFieldType.type === 'media' && this.selectedFieldType.input !== 'upload';
  }

  get canDisplay() {
    return this.selectedFieldType.input !== 'upload' && this.selectedFieldType.type !== 'tags';
  }

  addNewTask() {
    // this.matDialogRef.close(this.newTask);
  }

  selectField(field: Partial<FormAttributeInterface>) {
    this.selectedFieldType = field;
  }

  hasOptions(attribute: FormAttributeInterface) {
    return ['checkbox', 'radio', 'select'].some((a) => a === attribute.input);
  }

  removeOption(i: any) {
    this.selectedFieldType.options.splice(i, 1);
  }
  addOption(attribute: FormAttributeInterface) {
    attribute.options.push('');
  }

  validateDuplicate() {
    return true;
  }
}
