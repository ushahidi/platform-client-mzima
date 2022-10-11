import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { surveyHelper } from '@helpers';
import { CategoryInterface, FormAttributeInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService } from '@services';
import { map } from 'rxjs';
import { MultilevelSelectOption } from 'src/app/shared/components';

@Component({
  selector: 'app-create-field-modal',
  templateUrl: './create-field-modal.component.html',
  styleUrls: ['./create-field-modal.component.scss'],
})
export class CreateFieldModalComponent {
  fields = surveyHelper.surveyFields;
  selectedFieldType: any;
  editMode = true;
  label: any;
  availableCategories: MultilevelSelectOption[];
  categories: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<CreateFieldModalComponent>,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit() {
    this.editMode = !!this.data.selectedFieldType;
    this.selectedFieldType = this.data.selectedFieldType;
    this.categoriesService
      .get()
      .pipe(
        map((res) => {
          return res?.results?.map((category: CategoryInterface) => {
            return {
              id: category.id,
              name: category.tag,
              children: res?.results
                ?.filter((cat: CategoryInterface) => cat.parent_id === category.id)
                .map((cat: CategoryInterface) => {
                  return {
                    id: cat.id,
                    name: cat.tag,
                  };
                }),
            };
          });
        }),
      )
      .subscribe({
        next: (response) => {
          this.availableCategories = response;
        },
      });
  }

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
    this.matDialogRef.close(this.selectedFieldType);
  }

  selectField(field: Partial<FormAttributeInterface>) {
    this.selectedFieldType = field;
    this.selectedFieldType.label = this.translate.instant(this.selectedFieldType.label);
    this.selectedFieldType.description = this.translate.instant(this.selectedFieldType.description);
  }

  hasOptions(attribute: FormAttributeInterface) {
    return ['checkbox', 'radio', 'select'].some((a) => a === attribute.input);
  }

  removeOption(i: any) {
    this.selectedFieldType.options.splice(i, 1);
  }

  addOption(attribute: FormAttributeInterface) {
    if (!attribute.options) attribute.options = [];
    attribute.options.push('');
  }

  validateDuplicate() {
    if (surveyHelper.fieldCanHaveOptions(this.selectedFieldType)) {
      return surveyHelper.areOptionsUnique(this.selectedFieldType.options);
    }
    return true;
  }
}
