import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { surveyHelper } from '@helpers';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { MultilevelSelectOption } from '../../../shared/components';
import {
  CategoriesService,
  SurveysService,
  CategoryInterface,
  FormAttributeInterface,
  SurveyItem,
  apiHelpers,
} from '@mzima-client/sdk';
import { NotificationService } from '@services';
import _ from 'lodash';

@Component({
  selector: 'app-create-field-modal',
  templateUrl: './create-field-modal.component.html',
  styleUrls: ['./create-field-modal.component.scss'],
})
export class CreateFieldModalComponent implements OnInit {
  private surveyId: string;
  public fields = _.cloneDeep(surveyHelper.surveyFields);
  public selectedFieldType: any;
  public editMode = false;
  public availableCategories?: MultilevelSelectOption[];
  public categories: any = [];
  public availableSurveys: SurveyItem[] = [];
  public hasOptions = false;
  public fieldOptions: Array<{ value: string; error: string }> = [];
  public emptyTitleOption = false;
  public numberError = false;

  maxUploadSizes = surveyHelper.maxUploadSizes;
  isTranslateMode = false;
  selectLanguageCode = 'en';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<CreateFieldModalComponent>,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
    private surveysService: SurveysService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.isTranslateMode = this.data?.isTranslateMode;
    this.selectLanguageCode = this.data?.selectLanguageCode;
    if (this.data?.selectedFieldType) {
      this.editField();
    }
    this.surveyId = this.data?.surveyId;
    this.getCategories();
  }

  private editField() {
    this.editMode = true;

    this.selectedFieldType = this.data.selectedFieldType;

    this.setDefaultConfigValues();

    this.updateRadioCheckboxFields();

    this.updateTags();

    this.setHasOptionValidate();

    this.checkLoadAvailableData(this.selectedFieldType.input);

    if (Array.isArray(this.selectedFieldType.translations)) {
      this.selectedFieldType.translations = {};
    }

    if (!this.selectedFieldType.translations[this.selectLanguageCode]) {
      this.selectedFieldType.translations[this.selectLanguageCode] = { label: '' };
    }
  }

  private setDefaultConfigValues() {
    const defaultFieldType = surveyHelper.surveyFields.find(
      (surveyField) =>
        surveyField.input === this.selectedFieldType.input &&
        surveyField.type === this.selectedFieldType.type,
    );

    this.selectedFieldType.config = {
      ...defaultFieldType?.config,
      ...this.selectedFieldType?.config,
    };
  }

  private updateTags() {
    if (
      this.selectedFieldType.input === 'tags' &&
      this.selectedFieldType.options?.length &&
      typeof this.selectedFieldType.options[0] === 'object'
    ) {
      this.selectedFieldType.options = this.selectedFieldType.options.map(
        (option: any) => option.id,
      );
      this.setTempSelectedFieldType();
    }
  }

  private updateRadioCheckboxFields() {
    const checkTypes = ['radio', 'checkbox', 'select'];
    if (checkTypes.includes(this.selectedFieldType.input)) {
      this.fieldOptions = this.data?.selectedFieldType.options?.map((option: any) => ({
        value: option,
        error: '',
      }));
    }
  }

  private getCategories() {
    const array: MultilevelSelectOption[] = [];
    this.categoriesService
      .getCategories({ only: apiHelpers.ONLY.TAG_ID_PARENTID_CHILDREN })
      .pipe(
        map((res) => {
          for (const category of res?.results) {
            if (!category.parent_id) {
              array.push({
                id: category.id,
                name: category.tag,
                children: category.children.map((cat: CategoryInterface) => {
                  return {
                    id: cat.id,
                    name: cat.tag,
                  };
                }),
              });
            }
          }
          return array;
        }),
      )
      .subscribe({
        next: (response) => {
          this.availableCategories = response;
        },
        error: (err) => console.log(err),
      });
  }

  onChange(index: number) {
    const option = this.fieldOptions[index];
    this.selectedFieldType.options[index] = option.value.trim();
    this.checkForEmptyOptions();
    this.optionValidation(index);
  }

  optionValidation(index: number) {
    const option = this.fieldOptions[index];

    const duplicates = this.fieldOptions.filter((e, i) => e.value === option.value && i !== index);
    option.error = duplicates.length ? 'survey.duplicate_option' : '';
  }

  public checkForSpecialOptions(): boolean {
    return this.fieldOptions.some((option) => !!option.error);
  }

  private checkForEmptyOptions() {
    if (this.selectedFieldType.options.length) {
      this.emptyTitleOption = !!this.selectedFieldType.options.filter(
        (el: string) => el.trim() === '',
      ).length;
    }
  }

  get onlyOptional() {
    const types = ['tags', 'description', 'title'];
    return !types.includes(this.selectedFieldType.type);
  }

  get canMakePrivate() {
    const types = ['tags', 'description', 'title'];
    return !types.includes(this.selectedFieldType.type);
  }

  get canDisableCaption() {
    const types = ['media'];
    return types.includes(this.selectedFieldType.type);
  }

  get maximumUploadSize() {
    const types = ['media', 'document', 'audio'];
    return types.includes(this.selectedFieldType.type);
  }

  get canDisplay() {
    const inputs = [
      'upload',
      'tags',
      'location',
      'checkbox',
      'select',
      'radio',
      'date',
      'datetime',
    ];
    return !inputs.includes(this.selectedFieldType.input);
  }

  private loadAvailableSurveys() {
    this.surveysService.get().subscribe({
      next: (types) => {
        this.availableSurveys =
          types.results.filter((s: any) => s.id.toString() !== this.surveyId) || [];
      },
    });
  }

  private isNumber({ default: val, type }: any): boolean {
    if (!val) return true;
    if (type === 'decimal') {
      return /((?<!\S)[-+]?[0-9]*[.,][0-9]+$)/gm.test(String(val).trim());
    }
    if (type === 'int') {
      return /^-?\d+$/gm.test(String(val).trim());
    }
    return true;
  }

  public addNewTask() {
    if (this.selectedFieldType.input === 'number') {
      if (this.isNumber(this.selectedFieldType)) {
        this.numberError = false;
      } else {
        this.numberError = true;
        return;
      }
    }

    if (this.hasOptions && !this.selectedFieldType.options?.length) {
      this.notificationService.showError(this.translate.instant('survey.add_options_first'));
      return;
    }

    if (!this.selectedFieldType.translations) {
      this.selectedFieldType.translations = {};
    }

    this.matDialogRef.close({
      ...this.selectedFieldType,
      label: this.selectedFieldType.label.trim(),
    });
  }

  public selectField(field: Partial<FormAttributeInterface>) {
    this.selectedFieldType = _.cloneDeep(field);
    this.selectedFieldType.label = this.translate.instant(this.selectedFieldType.label);
    this.selectedFieldType.instructions = this.translate.instant(
      this.selectedFieldType.instructions,
    );
    this.setHasOptionValidate();
    this.checkLoadAvailableData(this.selectedFieldType.input);
  }

  private checkLoadAvailableData(input: string) {
    switch (input) {
      case 'relation':
        return this.loadAvailableSurveys();
    }
  }

  public removeOption(i: any) {
    this.selectedFieldType.options.splice(i, 1);
    this.fieldOptions.splice(i, 1);
    this.checkForEmptyOptions();
  }

  public addOption() {
    if (!this.selectedFieldType.options) this.selectedFieldType.options = [];
    this.checkForEmptyOptions();
    if (this.selectedFieldType.options.includes('Other')) {
      this.selectedFieldType.options.splice(this.selectedFieldType.options.length - 1, 0, '');
      this.fieldOptions.splice(this.fieldOptions.length - 1, 0, { value: '', error: '' });
    } else {
      this.selectedFieldType.options.push('');
      this.fieldOptions.push({ value: '', error: '' });
    }
  }

  public addOther() {
    if (!this.selectedFieldType.options) this.selectedFieldType.options = [];
    if (this.selectedFieldType.options.includes('Other')) return;
    this.selectedFieldType.options.push('Other');
    this.fieldOptions.push({ value: 'Other', error: '' });
  }

  private setTempSelectedFieldType() {
    this.fieldOptions = this.selectedFieldType.options.map((opt: string) => ({
      value: opt,
      error: '',
    }));
    this.fieldOptions.forEach((opt, i) => this.optionValidation(i));
  }

  private setHasOptionValidate() {
    this.hasOptions = ['checkbox', 'radio', 'select'].some(
      (a) => a === this.selectedFieldType.input,
    );
  }

  public validateDuplicate() {
    if (surveyHelper.fieldCanHaveOptions(this.selectedFieldType)) {
      return surveyHelper.areOptionsUnique(this.selectedFieldType.options);
    }
    return true;
  }
}
