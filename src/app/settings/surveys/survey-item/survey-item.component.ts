import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { surveyHelper } from '@helpers';
import { LanguageInterface, RoleResult, SurveyItemTask } from '@models';
import {
  FormsService,
  LanguageService,
  NotificationService,
  RolesService,
  SurveysService,
} from '@services';
import { SelectLanguagesModalComponent } from 'src/app/shared/components';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';
import { SurveyTaskComponent } from '../survey-task/survey-task.component';

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
  public form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
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
  public isEdit = false;
  roles: RoleResult[] = [];
  surveyId: string;
  additionalTasks: SurveyItemTask[] = [];
  mainPost: SurveyItemTask;
  surveyObject: any;
  public languages: LanguageInterface[] = this.languageService.getLanguages();
  public defaultLanguage?: LanguageInterface = this.languages.find((lang) => lang.code === 'en');
  public activeLanguages: LanguageInterface[] = this.defaultLanguage ? [this.defaultLanguage] : [];

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
  ) {}

  public ngOnInit(): void {
    this.initRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.surveyId = id;
      this.isEdit = !!id;
      this.surveysService.getById(id).subscribe({
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
      this.form.patchValue({ tasks: [surveyHelper.defaultTask] });
    }

    this.mainPost = this.form
      .get('tasks')
      ?.value.filter((t: SurveyItemTask) => t.type === 'post')[0];
    this.additionalTasks = this.form
      .get('tasks')
      ?.value.filter((t: SurveyItemTask) => t.type === 'task');
    this.form.controls['tasks'].valueChanges.subscribe((change) => {
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

  private getFormControl(name: string) {
    return this.form.controls[name];
  }

  public addTranslation(): void {
    const dialogRef = this.dialog.open(SelectLanguagesModalComponent, {
      width: '100%',
      maxWidth: 576,
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
        let translations: any = {};
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

  removeInterimIds() {}

  initRoles() {
    this.rolesService.get().subscribe((response) => {
      this.roles = response.results;
    });
  }

  saveRoles(formId: string) {
    const selectedRoles = this.configTask.selectedRoles.options!.map((r) => {
      return this.roles.find((role) => role.name === r);
    });
    const admin: any = this.roles.find((r: any) => r.name === 'admin');
    if (
      !this.getFormControl('everyone_can_create').value &&
      !selectedRoles.some((r) => r?.name === admin.name)
    ) {
      selectedRoles.push(admin);
    }

    this.formsService
      .updateRoles(
        formId,
        selectedRoles.map((r) => r?.id),
      )
      .subscribe();
  }

  public save() {
    const defaultLang: any[] = this.configTask.selectedLanguage;
    if (this.validateAttributeOptionTranslations() && this.validateAttributeOptionTranslations()) {
      this.removeInterimIds();
      this.form.patchValue({
        base_language: defaultLang,
      });

      const request = Object.assign({}, this.form.value, this.configTask.getConfigOptions());
      this.surveysService.saveSurvey(request, this.surveyId).subscribe((response) => {
        this.updateForm(response.result);
        this.saveRoles(response.result.id);
        this.router.navigate(['settings/surveys']);
      });
    } else {
      this.notification
        .showError(`You need to add translations for all names, and ensure checkboxes and radios do not have duplicates.
       Check that you have translated the survey-names for all added languages and that your checkbox and radio button values are unique (within each language).`);
    }
    console.log('save > form ', this.form.value);
  }

  public cancel() {
    this.router.navigate(['settings/surveys']);
  }

  addTask() {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      width: '100%',
      maxWidth: 576,
      minWidth: 300,
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
}
