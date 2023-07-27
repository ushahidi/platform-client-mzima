import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { surveyHelper } from '@helpers';
import { LanguageInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService } from '@services';
import { AlphanumericValidatorValidator, noWhitespaceValidator } from '../../../core/validators';
import { SelectLanguagesModalComponent } from '../../../shared/components';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';
import { SurveyTaskComponent } from '../survey-task/survey-task.component';
import {
  FormsService,
  SurveysService,
  RolesService,
  RoleResult,
  SurveyItemTask,
} from '@mzima-client/sdk';
import { NotificationService } from '../../../core/services/notification.service';
import { LanguageService } from '../../../core/services/language.service';
import _ from 'lodash';

@UntilDestroy()
@Component({
  selector: 'app-survey-item',
  templateUrl: './survey-item.component.html',
  styleUrls: ['./survey-item.component.scss'],
})
export class SurveyItemComponent implements OnInit {
  @ViewChild('configTask') configTask: SurveyTaskComponent;
  public selectLanguageCode: string;
  public description: string;
  public name: string;
  public form: FormGroup;
  public isEdit = false;
  roles: RoleResult[] = [];
  surveyId: string;
  additionalTasks: SurveyItemTask[] = [];
  mainPost: SurveyItemTask;
  surveyObject: any;
  public languages: LanguageInterface[];
  public defaultLanguage?: LanguageInterface;
  public activeLanguages: LanguageInterface[];
  public isDesktop = false;
  public errorTaskField = false;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    private formsService: FormsService,
    private rolesService: RolesService,
    private notification: NotificationService,
    private languageService: LanguageService,
    private breakpointService: BreakpointService,
    private location: Location,
  ) {
    this.languages = this.languageService.getLanguages();
    this.defaultLanguage = this.languages.find((lang) => lang.code === 'en');
    this.activeLanguages = this.defaultLanguage ? [this.defaultLanguage] : [];
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, noWhitespaceValidator, AlphanumericValidatorValidator()]],
      description: [''],
      color: [null],
      enabled_languages: this.formBuilder.group({
        default: ['en'],
        available: [[]],
      }),
      tasks: [[]],
      base_language: [''],
      require_approval: [true],
      everyone_can_create: [true],
      translations: [{}],
      can_create: [[]],
      disabled: [false],
      hide_author: [false],
      hide_location: [false],
      hide_time: [false],
      targeted_survey: [false],
      type: [''],
    });
  }

  public ngOnInit(): void {
    this.initRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.surveyId = id;
      this.isEdit = !!id;
      this.surveysService.getSurveyById(id).subscribe({
        next: (response) => {
          this.updateForm(response.result);
          this.initTasks();
        },
      });
    } else {
      this.initTasks(true);
    }
  }

  private initTasks(isNew = false) {
    this.surveyObject = this.form.value;

    if (isNew) {
      const defaultTask = _.cloneDeep(surveyHelper.defaultTask);
      this.form.patchValue({ tasks: [defaultTask] });
    }

    this.mainPost = this.form
      .get('tasks')
      ?.value.filter((t: SurveyItemTask) => t.type === 'post')[0];
    this.additionalTasks = this.form
      .get('tasks')
      ?.value.filter((t: SurveyItemTask) => t.type === 'task');
    this.form.controls['tasks'].valueChanges.pipe(untilDestroyed(this)).subscribe((change) => {
      this.additionalTasks = change.filter((t: SurveyItemTask) => t.type === 'task');
    });
  }

  updateForm(data: any) {
    Object.keys(data).forEach((key) => {
      if (this.form.controls[key]) {
        this.form.controls[key].patchValue(data[key]);
      }
    });
  }

  taskUpdate(data: any) {
    let tasks = this.form.controls['tasks'].value;
    tasks = tasks.map((task: any) => (task.id === data.id ? data : task));

    this.form.patchValue({
      tasks: tasks,
    });
  }

  private getFormControl(name: string) {
    return this.form.controls[name];
  }

  public addTranslation(): void {
    const dialogRef = this.dialog.open(SelectLanguagesModalComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'select-languages-modal'],
      data: {
        languages: this.languages,
        activeLanguages: this.activeLanguages,
        defaultLanguage: this.defaultLanguage,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (selectedLanguages: LanguageInterface[]) => {
        if (!selectedLanguages) return;
        this.getFormControl('enabled_languages').value.available = selectedLanguages
          .filter((language) => language.code !== this.defaultLanguage?.code)
          .map((language) => language.code);
        const translations: any = {};
        selectedLanguages
          .filter((language) => language.code !== this.defaultLanguage?.code)
          .map((language) => {
            translations[language.code] = {
              name: this.getFormControl('translations').value[language.code]?.name || '',
              description:
                this.getFormControl('translations').value[language.code]?.description || '',
            };
          });
        this.getFormControl('translations').setValue(translations);
      },
    });
  }

  public chooseTranslation(language: LanguageInterface): void {
    this.selectLanguageCode = language.code;
    this.name = this.description = '';
  }

  public setTranslates(languageCode: string, field: string, event: any) {
    const translations = this.getFormControl('translations').value;
    for (const key in translations) {
      if (key === languageCode) {
        translations[key] = {
          ...translations[key],
          [field]: event.target.value,
        };
        this.form.patchValue({
          translations: translations,
        });
      }
    }
  }

  initRoles() {
    this.rolesService.getRoles().subscribe((response) => {
      this.roles = response.results;
    });
  }

  saveRoles(formId: string, selectedRoles?: any[]) {
    const admin: any = this.roles.find((r: any) => r.name === 'admin');
    if (
      !this.getFormControl('everyone_can_create').value &&
      !selectedRoles?.some((r) => r?.name === admin.name)
    ) {
      selectedRoles?.push(admin);
    }
    if (selectedRoles !== undefined) {
      this.formsService
        .updateRoles(
          formId,
          selectedRoles.map((r: any) => r?.id),
        )
        .subscribe();
    }
  }

  public save() {
    this.submitted = true;
    const defaultLang: any[] = this.configTask.selectedLanguage;
    if (this.validateAttributeOptionTranslations() && this.validateAttributeOptionTranslations()) {
      this.form.patchValue({
        base_language: defaultLang,
      });

      const selectedRoles = this.configTask.selectedRoles.options?.map((r: any) =>
        this.roles.find((role) => role.name === r),
      );

      const request = Object.assign(
        {},
        {
          ...this.form.value,
          name: this.form.value.name.trim(),
          description: this.form.value.description.trim(),
          everyone_can_create: !selectedRoles?.length,
        },
        this.configTask.getConfigOptions(),
      );
      this.surveysService.saveSurvey(request, this.surveyId).subscribe({
        next: (response) => {
          this.updateForm(response.result);
          this.saveRoles(response.result.id, selectedRoles);
          this.router.navigate(['settings/surveys']);
        },
        error: ({ error }) => {
          this.submitted = false;
          this.notification.showError(JSON.stringify(error.name[0]));
        },
      });
    } else {
      this.notification
        .showError(`You need to add translations for all names, and ensure checkboxes and radios do not have duplicates.
       Check that you have translated the survey-names for all added languages and that your checkbox and radio button values are unique (within each language).`);
    }
  }

  public cancel() {
    if (this.isDesktop) {
      this.router.navigate(['settings/surveys']);
    } else {
      this.location.back();
    }
  }

  addTask() {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      width: '100%',
      maxWidth: 576,
      minWidth: 300,
      panelClass: 'modal',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response) {
          const tasks: SurveyItemTask[] = this.getFormControl('tasks').value;
          tasks.push(response);
          this.form.patchValue({ tasks });
        }
      },
    });
  }

  validateAttributeOptionTranslations() {
    const availableLangs: any[] = this.getFormControl('enabled_languages').value.available;
    const tasks: SurveyItemTask[] = this.getFormControl('tasks').value;

    return availableLangs.every((language) => {
      return tasks.every((t) => {
        return t.fields.every((f) => {
          if (
            surveyHelper.fieldHasTranslations(f, language) &&
            surveyHelper.fieldCanHaveOptions(f)
          ) {
            return surveyHelper.areOptionsUnique(Object.values(f.translations[language].options));
          } else {
            return true;
          }
        });
      });
    });
  }

  validateSurveyTranslations() {
    const availableLangs: any[] = this.getFormControl('enabled_languages').value.available;
    const translations = this.getFormControl('translations').value;

    return availableLangs.every((language) => {
      return translations[language]?.name;
    });
  }

  public setNewColor(color: string): void {
    this.form.patchValue({ color });
  }

  public deleteTask(task: SurveyItemTask) {
    const tasks: SurveyItemTask[] = this.getFormControl('tasks').value;
    const index = tasks.indexOf(task);
    tasks.splice(index, 1);
    this.form.patchValue({ tasks });
  }

  public duplicateTask(task: SurveyItemTask) {
    const tasks: SurveyItemTask[] = this.getFormControl('tasks').value;
    tasks.push(task);
    this.form.patchValue({ tasks });
  }

  public setErrorTaskField(event: boolean) {
    this.errorTaskField = event;
  }
}
