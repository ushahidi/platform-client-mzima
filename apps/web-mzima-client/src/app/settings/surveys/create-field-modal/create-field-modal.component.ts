import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { surveyHelper } from '@helpers';
import { CategoryInterface, FormAttributeInterface, SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { MultilevelSelectOption } from '../../../shared/components';
import { CategoriesService } from '../../../core/services/categories.service';
import { SurveysService } from '../../../core/services/surveys.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  public tmp: any[] = [];
  public emptyTitleOption = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<CreateFieldModalComponent>,
    private translate: TranslateService,
    private categoriesService: CategoriesService,
    private surveysService: SurveysService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    if (this.data?.selectedFieldType) {
      this.editField();
    }
    this.surveyId = this.data?.surveyId;
    this.getCategories();
  }

  private editField() {
    this.selectedFieldType = this.data.selectedFieldType;
    if (
      this.selectedFieldType.input === 'tags' &&
      this.selectedFieldType.options?.length &&
      typeof this.selectedFieldType.options[0] === 'object'
    ) {
      this.selectedFieldType.options = this.selectedFieldType.options.map(
        (option: any) => option.id,
      );
    }
    this.editMode = true;
    this.setHasOptionValidate();
    this.checkLoadAvailableData(this.selectedFieldType.input);
    this.setTempSelectedFieldType();
  }

  private getCategories() {
    const array: MultilevelSelectOption[] = [];
    this.categoriesService
      .get()
      .pipe(
        map((res) => {
          for (const category of res?.results) {
            if (!category.parent_id) {
              array.push({
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

  onChange($event: string, i: any) {
    this.selectedFieldType.options[i] = $event.trim();
    this.checkForEmptyOptions();
  }

  private checkForEmptyOptions() {
    if (this.selectedFieldType.options.length) {
      this.emptyTitleOption = !!this.selectedFieldType.options.filter(
        (el: string) => el.trim() === '',
      ).length;
    }
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
          types.results.filter((s: any) => s.id.toString() !== this.surveyId) || [];
      },
    });
  }

  public addNewTask() {
    if (this.hasOptions && !this.selectedFieldType.options?.length) {
      this.notificationService.showError(this.translate.instant('survey.add_options_first'));
      return;
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
    this.setTempSelectedFieldType();
    this.checkForEmptyOptions();
  }

  public addOption() {
    if (!this.selectedFieldType.options) this.selectedFieldType.options = [];
    this.selectedFieldType.options.push('');
    this.setTempSelectedFieldType();
    this.checkForEmptyOptions();
  }

  private setTempSelectedFieldType() {
    this.tmp = this.selectedFieldType.options.map((opt: string) => ({
      value: opt,
    }));
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
