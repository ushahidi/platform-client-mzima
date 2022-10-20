import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { surveyHelper } from '@helpers';
import { CategoryInterface, FormAttributeInterface, SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService, SurveysService } from '@services';
import { map } from 'rxjs';
import { MultilevelSelectOption } from 'src/app/shared/components';

@Component({
  selector: 'app-create-field-modal',
  templateUrl: './create-field-modal.component.html',
  styleUrls: ['./create-field-modal.component.scss'],
})
export class CreateFieldModalComponent implements OnInit {
  fields = surveyHelper.surveyFields;
  selectedFieldType: any;
  editMode = false;
  label: any;
  availableCategories: MultilevelSelectOption[];
  categories: any = [];
  availableSurveys: SurveyItem[] = [];
  surveyId: string;
  hasOptions = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<CreateFieldModalComponent>,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
    private surveysService: SurveysService,
  ) {}

  ngOnInit() {
    if (this.data?.selectedFieldType) {
      this.selectedFieldType = this.data.selectedFieldType;
      this.editMode = true;
      this.hasOptions = ['checkbox', 'radio', 'select'].some(
        (a) => a === this.selectedFieldType.input,
      );
      if (this.selectedFieldType.input === 'relation') {
        this.loadAvailableSurveys();
      }
    }

    this.surveyId = this.data?.surveyId;

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
    return this.selectedFieldType.type === 'media' && this.selectedFieldType.input === 'upload';
  }

  get canDisplay() {
    return this.selectedFieldType.input !== 'upload' && this.selectedFieldType.type !== 'tags';
  }

  private loadAvailableSurveys() {
    this.surveysService.get().subscribe({
      next: (types) => {
        this.availableSurveys =
          types.results.filter((s) => s.id.toString() !== this.surveyId) || [];
      },
    });
  }

  addNewTask() {
    this.matDialogRef.close(this.selectedFieldType);
  }

  selectField(field: Partial<FormAttributeInterface>) {
    this.selectedFieldType = field;
    this.selectedFieldType.label = this.translate.instant(this.selectedFieldType.label);
    this.selectedFieldType.description = this.translate.instant(this.selectedFieldType.description);
    this.hasOptions = ['checkbox', 'radio', 'select'].some(
      (a) => a === this.selectedFieldType.input,
    );
    if (field.input === 'relation') {
      this.loadAvailableSurveys();
    }
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
